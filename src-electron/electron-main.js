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
import {
  unlinkSync,
  appendFileSync,
  chmodSync,
  statSync,
  existsSync,
  writeFileSync,
} from 'node:fs'

import { envDefaults } from '../src/config/app.conf.js'
import registerPackagesHandlers from './handlers/packages.js'
import registerPreferencesHandlers from './handlers/preferences.js'
import registerComputerHandlers from './handlers/computer.js'
import registerTokenHandlers from './handlers/token.js'
import registerExecutionsHandlers from './handlers/executions.js'
import registerTagsHandlers from './handlers/tags.js'
import { getClientVersion } from './python-utils.js'
import registerUserHandlers from './handlers/user.js'
import registerAppsHandlers from './handlers/apps.js'
import registerDevicesHandlers from './handlers/devices.js'

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
registerAppsHandlers()
registerDevicesHandlers()

app.canExit = true
app.syncAfterStart = process.argv.includes('sync')
app.debug = process.argv.includes('debug')

const logFile = path.join(os.tmpdir(), 'migasfree-play.log')
const logStream = (message, type = 'INFO') => {
  if (!app.debug) return
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] [${type}] ${message}\n`
  try {
    appendFileSync(logFile, logMessage, { mode: 0o600 })
    chmodSync(logFile, 0o600)
  } catch {
    // Ignore write/chmod errors
  }
}

const serializeArg = (arg) => {
  if (arg === null) return 'null'
  if (arg === undefined) return 'undefined'

  if (arg instanceof Error || (typeof arg === 'object' && 'message' in arg)) {
    const errObj = {}
    Object.getOwnPropertyNames(arg).forEach((key) => {
      errObj[key] = arg[key]
    })
    // If it's an Axios error, include response status and data
    if (arg.response) {
      errObj.response = {
        status: arg.response.status,
        data: arg.response.data,
      }
    }
    return JSON.stringify(errObj, null, 2)
  }

  if (typeof arg === 'object') {
    try {
      const str = JSON.stringify(arg, null, 2)
      return str === '{}' ? String(arg) : str
    } catch {
      return String(arg)
    }
  }

  return String(arg)
}

const originalLog = console.log
const originalError = console.error

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

// IPC Handlers - App State
ipcMain.handle('app:get-sync-after-start', () => app.syncAfterStart)
ipcMain.handle('app:get-platform', () => process.platform)
ipcMain.handle('app:get-env-config', async () => {
  const user = process.env.MFP_USER || envDefaults.user
  const password = process.env.MFP_PASSWORD || envDefaults.password

  let isV5 = false
  try {
    const version = await getClientVersion()
    if (version && !version.startsWith('4.')) {
      isV5 = true
    }
  } catch (err) {
    // Ignore error, assume v4
  }

  if (
    !isV5 &&
    (user === envDefaults.user || password === envDefaults.password)
  ) {
    console.warn(
      '[Security] Application is using default credentials. Set MFP_USER and MFP_PASSWORD environment variables.',
    )
  }

  return {
    executionsLimit:
      parseInt(process.env.MFP_EXECUTIONS_LIMIT) || envDefaults.executionsLimit,
    user,
    password,
  }
})
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
  const win = BrowserWindow.fromWebContents(event.sender)
  if (win) {
    win.hide()
    win.close()
  }
})

// IPC Handlers - Auto Update
ipcMain.on('app:relaunch', () => {
  console.log('[AutoUpdate] Restarting application by user request...')
  app.canExit = true
  app.relaunch()
  app.quit()
})

// IPC Handlers - Command Execution
const ALLOWED_COMMANDS = ['migasfree']

ipcMain.on('command:spawn', (event, { id, command, args, input, env }) => {
  if (runningProcesses.has(id)) {
    console.log(
      `[Process Manager] Process ${id} is already registered. Re-attaching...`,
    )
    const proc = runningProcesses.get(id)
    proc.webContents = event.sender

    // Stream buffered logs back to the new webContents
    if (proc.stdout) {
      event.sender.send(`command:stdout:${id}`, proc.stdout)
    }
    if (proc.stderr) {
      event.sender.send(`command:stderr:${id}`, proc.stderr)
    }
    // If the process has already completed/failed, trigger exit event immediately
    if (proc.status !== 'running') {
      event.sender.send(`command:exit:${id}`, proc.exitCode)
    }
    return
  }

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
    env: { ...process.env, MIGASFREE_CLIENT_DEBUG: 'False', ...env },
  })

  // Set safety timeout (30 minutes max) in Main Process to survive Renderer reloads
  const timeoutId = setTimeout(
    () => {
      console.error(
        `[Process Timeout] Process ${id} exceeded max time. Killing...`,
      )
      const proc = runningProcesses.get(id)
      if (proc && proc.subprocess) {
        proc.subprocess.kill('SIGKILL')
      }
      if (proc) {
        proc.status = 'failed'
        proc.exitCode = 1
        proc.stderr += '\n[Command timeout - forced cleanup]\n'
        if (proc.webContents && !proc.webContents.isDestroyed()) {
          proc.webContents.send(
            `command:stderr:${id}`,
            '\n[Command timeout - forced cleanup]\n',
          )
          proc.webContents.send(`command:exit:${id}`, 1)
        }
      }
    },
    30 * 60 * 1000,
  )

  runningProcesses.set(id, {
    subprocess,
    timeoutId,
    stdout: '',
    stderr: '',
    status: 'running',
    exitCode: null,
    command,
    args,
    startTime: Date.now(),
    webContents: event.sender,
  })

  // Write input to stdin if provided (e.g., "y\n" for confirmation)
  if (input) {
    subprocess.stdin.write(input)
    subprocess.stdin.end()
  }

  subprocess.stdout.on('data', (data) => {
    const proc = runningProcesses.get(id)
    if (proc) {
      proc.stdout += data.toString()
      if (proc.webContents && !proc.webContents.isDestroyed()) {
        proc.webContents.send(`command:stdout:${id}`, data.toString())
      }
    }
  })

  subprocess.stderr.on('data', (data) => {
    const proc = runningProcesses.get(id)
    if (proc) {
      proc.stderr += data.toString()
      if (proc.webContents && !proc.webContents.isDestroyed()) {
        proc.webContents.send(`command:stderr:${id}`, data.toString())
      }
    }
  })

  subprocess.on('exit', (code) => {
    const proc = runningProcesses.get(id)
    if (proc) {
      clearTimeout(proc.timeoutId)
      proc.status = code === 0 ? 'completed' : 'failed'
      proc.exitCode = code
      if (proc.webContents && !proc.webContents.isDestroyed()) {
        proc.webContents.send(`command:exit:${id}`, code)
      }
    }
  })

  subprocess.on('error', (err) => {
    const proc = runningProcesses.get(id)
    if (proc) {
      clearTimeout(proc.timeoutId)
      proc.status = 'failed'
      proc.exitCode = 1
      proc.stderr += err.message
      if (proc.webContents && !proc.webContents.isDestroyed()) {
        proc.webContents.send(`command:stderr:${id}`, err.message)
        proc.webContents.send(`command:exit:${id}`, 1)
      }
    }
  })
})

ipcMain.on('command:kill', (_, { id }) => {
  const proc = runningProcesses.get(id)
  if (proc) {
    clearTimeout(proc.timeoutId)
    proc.status = 'cancelled'
    proc.exitCode = 1
    if (proc.subprocess) {
      proc.subprocess.kill('SIGTERM')
    }
  }
})

ipcMain.on('command:cleanup', (_, { id }) => {
  console.log(`[Process Manager] Cleaning up command registration: ${id}`)
  runningProcesses.delete(id)
})

ipcMain.handle('command:get-active', () => {
  const tasks = []
  for (const [id, proc] of runningProcesses.entries()) {
    tasks.push({
      id,
      command: proc.command,
      args: proc.args,
      status: proc.status,
      stdout: proc.stdout,
      stderr: proc.stderr,
      exitCode: proc.exitCode,
      startTime: proc.startTime,
    })
  }
  return tasks
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
      backgroundThrottling: false,

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

  // Start the IPC bindings for Auto-Update events
  setupAutoUpdateIPC(mainWindow)
}

if (!gotTheLock) {
  console.log('Another instance is running. Exiting...')
  app.quit()
} else {
  app.on('second-instance', (event, commandLine) => {
    // Someone tried to run a second instance, we should focus our window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()

      if (commandLine.includes('sync')) {
        mainWindow.webContents.send('app:trigger-sync')
      }
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

let updateNotified = false
let updatePollingInterval = null
let updateTimeout = null
let lastMtime = 0

/**
 * Setup a watcher on the application executable or ASAR bundle.
 * If the package manager updates the app in background, we notify the Renderer
 * to show a "Restart Required" prompt.
 */
function setupAutoUpdateIPC(win) {
  let appPath = app.getAppPath()

  // In development, watch a dummy file
  if (process.env.DEV) {
    appPath = path.join(os.tmpdir(), 'migasfree-play-update.dummy')
    if (!existsSync(appPath)) {
      try {
        writeFileSync(appPath, 'dummy content')
      } catch (e) {
        console.error(`[AutoUpdate] Error creating dummy file: ${e.message}`)
      }
    }
  }

  // Initialize lastMtime immediately at startup
  try {
    if (existsSync(appPath)) {
      lastMtime = statSync(appPath).mtimeMs
      console.log(
        `[AutoUpdate] Initialized file watch on ${appPath} (mtime: ${lastMtime})`,
      )
    }
  } catch (err) {
    console.error(`[AutoUpdate] Initial stat failed: ${err.message}`)
  }

  const pollFile = () => {
    if (updateNotified) return

    try {
      if (existsSync(appPath)) {
        const currentMtime = statSync(appPath).mtimeMs
        if (lastMtime > 0 && currentMtime > lastMtime) {
          updateNotified = true
          console.log(
            `[AutoUpdate] Detected background update at ${appPath}. Notifying UI...`,
          )
          if (win && !win.isDestroyed()) {
            win.webContents.send('app:update-available')
          }
        }
        lastMtime = currentMtime
      }
    } catch (err) {
      console.error(`[AutoUpdate] Polling failed: ${err.message}`)
    }
  }

  // Start low-frequency continuous background polling (every 10 seconds)
  setInterval(pollFile, 10000)

  ipcMain.on('app:start-update-polling', () => {
    if (updateNotified) return
    console.log('[AutoUpdate] Starting high-frequency FS polling...')

    // Reset tail timeout if it was cooling down
    if (updateTimeout) {
      clearTimeout(updateTimeout)
      updateTimeout = null
    }

    try {
      if (existsSync(appPath)) lastMtime = statSync(appPath).mtimeMs
    } catch {
      // Ignore if file is briefly missing during update
    }

    // Ensure we don't spawn multiple intervals
    if (!updatePollingInterval) {
      updatePollingInterval = setInterval(pollFile, 2000)
    }
  })

  ipcMain.on('app:stop-update-polling', () => {
    console.log(
      '[AutoUpdate] Stopping high-frequency FS polling in 60 seconds (cooldown tail)...',
    )

    // Keep surveying for a minute after the task finished to catch the pkg manager trailing moves
    updateTimeout = setTimeout(() => {
      if (updatePollingInterval) {
        console.log(
          '[AutoUpdate] High-frequency FS polling officially stopped.',
        )
        clearInterval(updatePollingInterval)
        updatePollingInterval = null
      }
    }, 60000)
  })
}
