/* eslint no-undef: "off" */

import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import { spawn } from 'child_process'
import {
  app,
  BrowserWindow,
  nativeTheme,
  Menu,
  screen,
  ipcMain,
} from 'electron'
import { unlinkSync, appendFileSync } from 'fs'

import { envDefaults } from '../src/config/app.conf.js'
import registerPackagesHandlers from './handlers/packages.js'
import registerPreferencesHandlers from './handlers/preferences.js'
import registerComputerHandlers from './handlers/computer.js'
import registerTokenHandlers from './handlers/token.js'
import registerExecutionsHandlers from './handlers/executions.js'
import registerTagsHandlers from './handlers/tags.js'
import registerUserHandlers from './handlers/user.js'

const platform = process.platform || os.platform()
const currentDir = fileURLToPath(new URL('.', import.meta.url))
const runningProcesses = new Map() // Store running command processes for IPC

// Register new IPC handlers
registerPackagesHandlers()
registerPreferencesHandlers()
registerComputerHandlers()
registerTokenHandlers()
registerExecutionsHandlers()
registerTagsHandlers()
registerUserHandlers()

app.canExit = true
app.syncAfterStart = process.argv.includes('sync')
app.debug = process.argv.includes('debug')

if (app.debug) {
  const logFile = path.join(os.tmpdir(), 'migasfree-play.log')
  const logStream = (message, type = 'INFO') => {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] [${type}] ${message}\n`
    try {
      appendFileSync(logFile, logMessage)
    } catch {
      // Ignore write errors
    }
  }

  const originalLog = console.log
  const originalError = console.error

  const serializeArg = (arg) => {
    if (arg instanceof Error) {
      return JSON.stringify(
        arg,
        (key, value) => {
          if (value instanceof Error) {
            return Object.getOwnPropertyNames(value).reduce((acc, k) => {
              acc[k] = value[k]
              return acc
            }, {})
          }
          return value
        },
        2,
      )
    }
    return typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
  }

  console.log = (...args) => {
    const message = args.map(serializeArg).join(' ')
    logStream(message, 'INFO')
    originalLog.apply(console, args)
  }

  console.error = (...args) => {
    const message = args.map(serializeArg).join(' ')
    logStream(message, 'ERROR')
    originalError.apply(console, args)
  }

  ipcMain.on('app:log', (_, { message, type }) => {
    logStream(message, type)
  })
}

// IPC Handlers - App State
ipcMain.handle('app:get-sync-after-start', () => app.syncAfterStart)
ipcMain.handle('app:get-platform', () => process.platform)
ipcMain.handle('app:get-env-config', () => ({
  executionsLimit:
    parseInt(process.env.MFP_EXECUTIONS_LIMIT) || envDefaults.executionsLimit,
  user: process.env.MFP_USER || envDefaults.user,
  password: process.env.MFP_PASSWORD || envDefaults.password,
}))
ipcMain.on('app:set-can-exit', (_, value) => {
  app.canExit = value
})

// IPC Handlers - Window Control
ipcMain.handle('window:show', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.show()
})
ipcMain.handle('window:is-minimized', (event) => {
  return BrowserWindow.fromWebContents(event.sender)?.isMinimized() ?? false
})
ipcMain.handle('window:close', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.close()
})

// IPC Handlers - Command Execution
const ALLOWED_COMMANDS = ['migasfree']

ipcMain.on('command:spawn', (event, { id, command, args, input, env }) => {
  if (!ALLOWED_COMMANDS.includes(command)) {
    console.error(
      `[Security] Blocked unauthorized command execution attempt: ${command}`,
    )
    if (!event.sender.isDestroyed()) {
      event.sender.send(
        `command:stderr:${id}`,
        `Error: Command "${command}" is not allowed.`,
      )
      event.sender.send(`command:exit:${id}`, 1)
    }
    return
  }

  const shellOption = process.platform === 'linux' ? '/bin/bash' : true
  const subprocess = spawn(command, args, {
    shell: shellOption,
    env: { ...process.env, ...env },
  })

  runningProcesses.set(id, subprocess)

  // Write input to stdin if provided (e.g., "y\n" for confirmation)
  if (input) {
    subprocess.stdin.write(input)
    subprocess.stdin.end()
  }

  subprocess.stdout.on('data', (data) => {
    if (!event.sender.isDestroyed()) {
      event.sender.send(`command:stdout:${id}`, data.toString())
    }
  })

  subprocess.stderr.on('data', (data) => {
    if (!event.sender.isDestroyed()) {
      event.sender.send(`command:stderr:${id}`, data.toString())
    }
  })

  subprocess.on('exit', (code) => {
    runningProcesses.delete(id)
    if (!event.sender.isDestroyed()) {
      event.sender.send(`command:exit:${id}`, code)
    }
  })

  subprocess.on('error', (err) => {
    runningProcesses.delete(id)
    if (!event.sender.isDestroyed()) {
      event.sender.send(`command:stderr:${id}`, err.message)
      event.sender.send(`command:exit:${id}`, 1)
    }
  })
})

ipcMain.on('command:kill', (_, { id }) => {
  const subprocess = runningProcesses.get(id)
  if (subprocess) {
    subprocess.kill('SIGTERM')
    runningProcesses.delete(id)
  }
})

app.commandLine.appendSwitch('ignore-certificate-errors')

const gotTheLock = app.requestSingleInstanceLock()

if (platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
  unlinkSync(path.join(app.getPath('userData'), 'DevTools Extensions'))
}

let mainWindow

async function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { height } = primaryDisplay.workAreaSize

  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(currentDir, 'img', 'migasfree-play.png'),
    width: 800,
    height: Math.min(height, 800),
    show: false,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,

      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      preload: path.resolve(
        currentDir,
        path.join(
          process.env.QUASAR_ELECTRON_PRELOAD_FOLDER,
          'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION,
        ),
      ),
    },
  })

  mainWindow.webContents.session.setProxy({ mode: 'system' })

  if (process.env.DEV) {
    mainWindow.loadURL(process.env.APP_URL)
  } else {
    mainWindow.loadFile('index.html')
  }

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools()
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools()
    })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('ready-to-show', () => {
    if (app.syncAfterStart) {
      mainWindow.showInactive()
      mainWindow.minimize()
    } else mainWindow.show()
  })

  mainWindow.on('close', (e) => {
    if (!app.canExit) e.preventDefault() // Prevents the window from closing
  })

  Menu.setApplicationMenu(null)
}

if (!gotTheLock) {
  console.log('Another instance is running. Exiting...')
  app.quit()
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.whenReady().then(createWindow)

  app.on('window-all-closed', () => {
    if (platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow()
    }
  })

  app.on('before-quit', () => {
    // No explicit cleanup needed
  })
}
