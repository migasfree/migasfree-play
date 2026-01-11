/* eslint no-undef: "off" */

import { fileURLToPath } from 'node:url'
import net from 'node:net'
import path from 'node:path'
import os from 'node:os'
import tcpPortUsed from 'tcp-port-used'
import { spawn } from 'child_process'
import {
  app,
  BrowserWindow,
  nativeTheme,
  Menu,
  screen,
  ipcMain,
} from 'electron'
import { unlinkSync } from 'fs'

import { envDefaults } from '../src/config/app.conf.js'

const platform = process.platform || os.platform()
const currentDir = fileURLToPath(new URL('.', import.meta.url))
let expressProcess
const runningProcesses = new Map() // Store running command processes for IPC

const EXPRESS_PORT = parseInt(process.env.MFP_EXPRESS_PORT || 3000)
const IS_PRODUCTION = process.env.NODE_ENV === 'production'
function launchExpress() {
  tcpPortUsed.check(EXPRESS_PORT, '127.0.0.1').then(
    (inUse) => {
      if (app.debug) console.log(`Port ${EXPRESS_PORT} usage: ${inUse}`)

      if (!inUse) {
        const expressApi = IS_PRODUCTION
          ? path.join(process.resourcesPath, 'app', 'api.js')
          : path.join(currentDir, '..', 'dev-electron', 'api')

        // Instantiate Express App
        if (app.debug)
          console.log('Instantiating express app...!!!', expressApi)

        expressProcess = spawn('node', [expressApi, app.debug ? 'debug' : ''], {
          detached: false,
        })

        if (app.debug)
          console.log('Inside tcpPortUsed, express PID', expressProcess.pid)

        expressProcess.stdout.on('data', (data) => {
          console.log(`[Express stdout] ${data}`)
        })

        expressProcess.stderr.on('data', (data) => {
          console.error(`[Express stderr] ${data}`)
        })
      }
    },

    (err) => {
      console.error(`[Port Check Error] ${err.message}`)
    },
  )
}

app.canExit = true
app.syncAfterStart = process.argv.includes('sync')
app.debug = process.argv.includes('debug')

launchExpress()

// IPC Handlers - App State
ipcMain.handle('app:get-sync-after-start', () => app.syncAfterStart)
ipcMain.handle('app:get-platform', () => process.platform)
ipcMain.handle('app:get-env-config', () => ({
  expressPort:
    parseInt(process.env.MFP_EXPRESS_PORT) || envDefaults.expressPort,
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
ipcMain.on('command:spawn', (event, { id, command, args }) => {
  const shellOption = process.platform === 'linux' ? '/bin/bash' : true
  const subprocess = spawn(command, args, { shell: shellOption })

  runningProcesses.set(id, subprocess)

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

async function waitForServer() {
  return new Promise((resolve) => {
    const checkPort = () => {
      const client = net.createConnection(EXPRESS_PORT, '127.0.0.1', () => {
        client.destroy() // close connection after success
        resolve()
      })
      client.on('error', () => {
        client.destroy()
        if (app.debug) console.log('Retrying check express port')
        setTimeout(checkPort, 100) // retry after 100ms
      })
    }
    checkPort()
  })
}

let mainWindow

async function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { height } = primaryDisplay.workAreaSize

  try {
    await waitForServer() // waiting express app to be ready
  } catch (error) {
    console.error('[Express server connection error]', error)
  }

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
    if (expressProcess) {
      expressProcess.stdin.pause()
      expressProcess.kill('SIGTERM')
    }
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
    if (expressProcess) {
      expressProcess.stdin.pause()
      expressProcess.kill('SIGTERM')
    }
  })
}
