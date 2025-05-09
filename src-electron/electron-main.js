/* eslint no-undef: "off" */

import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import tcpPortUsed from 'tcp-port-used'
import { spawn } from 'child_process'
import { app, BrowserWindow, nativeTheme, Menu, screen } from 'electron'
import { initialize, enable } from '@electron/remote/main/index.js'
import { unlinkSync } from 'fs'

const platform = process.platform || os.platform()
const currentDir = fileURLToPath(new URL('.', import.meta.url))
let expressProcess

function launchExpress() {
  const isProduction = process.env.NODE_ENV === 'production'
  const port = parseInt(process.env.MFP_EXPRESS_PORT || 3000)

  tcpPortUsed.check(port, '127.0.0.1').then(
    function (inUse) {
      if (app.debug) console.log(`Port ${port} usage: ${inUse}`)

      if (!inUse) {
        const expressApi = isProduction
          ? path.join(process.resourcesPath, 'app', 'api.js')
          : path.join(currentDir, '..', 'dev-electron', 'api')

        // Instantiate Express App
        if (app.debug)
          console.log('instantiating express app...!!!', expressApi)

        expressProcess = spawn('node', [expressApi, app.debug ? 'debug' : ''], {
          detached: false,
        })

        if (app.debug)
          console.log('inside tcpPortUsed, express PID', expressProcess.pid)

        expressProcess.stdout.on('data', (data) => {
          console.log(`stdout: ${data}`)
        })

        expressProcess.stderr.on('data', (data) => {
          console.error(`stderr: ${data}`)
        })
      }
    },

    function (err) {
      console.error('Error on check:', err.message)
    },
  )
}

app.canExit = true
app.syncAfterStart = process.argv.includes('sync')
app.debug = process.argv.includes('debug')

launchExpress()

initialize()

app.commandLine.appendSwitch('ignore-certificate-errors')

const gotTheLock = app.requestSingleInstanceLock()

if (platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
  unlinkSync(path.join(app.getPath('userData'), 'DevTools Extensions'))
}

// https://masteringjs.io/tutorials/fundamentals/sleep
function sleep(ms) {
  // add ms millisecond timeout before promise resolution
  return new Promise((resolve) => setTimeout(resolve, ms))
}

let mainWindow

async function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { height } = primaryDisplay.workAreaSize

  await sleep(500) // delay waiting express app

  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(currentDir, 'img', 'migasfree-play.png'),
    width: 800,
    height: height >= 800 ? 800 : height,
    show: false,
    useContentSize: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true, // process.env.QUASAR_NODE_INTEGRATION,
      nodeIntegrationInWorker: true, // process.env.QUASAR_NODE_INTEGRATION,
      nativeWindowOpen: true,
      sandbox: false,

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

  enable(mainWindow.webContents)

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
      expressProcess.kill('SIGINT')
    }
  })

  mainWindow.on('ready-to-show', () => {
    if (app.syncAfterStart) {
      mainWindow.minimize()
      mainWindow.minimize() // FIXME why second call is needed to minimize?
    } else mainWindow.show()
  })

  // Prevent opening external URL in app, open in default browser instead
  /* mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url) // import { shell } from 'electron'
  }) */

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
}
