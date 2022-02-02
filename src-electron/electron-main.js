import path from 'path'
const tcpPortUsed = require('tcp-port-used')
const spawn = require('child_process').spawn

let expressProcess = undefined

function launchExpress() {
  const isProduction = process.env.NODE_ENV === 'production'

  tcpPortUsed.check(3000, '127.0.0.1').then(
    function (inUse) {
      console.log('Port 3000 usage: ' + inUse) // debug
      if (!inUse) {
        const expressApi = isProduction
          ? path.join(__dirname, '..', 'app.asar.unpacked', 'api.js')
          : path.join(__dirname, '..', 'src', 'api')

        // Instantiate Express App
        console.log('instantiating express app...!!!', expressApi) // debug
        expressProcess = spawn('node', [expressApi], { detached: false })
        console.log('inside tcpPortUsed, express PID', expressProcess.pid) // debug

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
    }
  )
}

import { app, BrowserWindow, nativeTheme, Menu } from 'electron'
require('@electron/remote/main').initialize()

const gotTheLock = app.requestSingleInstanceLock()

app.canExit = true

try {
  if (
    process.platform === 'win32' &&
    nativeTheme.shouldUseDarkColors === true
  ) {
    require('fs').unlinkSync(
      require('path').join(app.getPath('userData'), 'DevTools Extensions')
    )
  }
} catch (_) {}

let mainWindow

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'img', 'migasfree-play.png'),
    width: 800,
    height: 800,
    useContentSize: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true, //process.env.QUASAR_NODE_INTEGRATION,
      nodeIntegrationInWorker: true, // process.env.QUASAR_NODE_INTEGRATION,
      nativeWindowOpen: true,
      sandbox: false,

      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
  })

  require('@electron/remote/main').enable(mainWindow.webContents)

  launchExpress()

  mainWindow.webContents.session.setProxy({ mode: 'system' })

  mainWindow.loadURL(process.env.APP_URL)

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

  mainWindow.webContents.on('did-finish-load', () => {
    if (process.argv.includes('sync')) {
      mainWindow.minimize()
    }
  })

  // Prevent opening external URL in app, open in default browser instead
  /* mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url)
  }) */

  mainWindow.on('close', (e) => {
    if (!app.canExit) e.preventDefault() // Prevents the window from closing
  })

  Menu.setApplicationMenu(null)
}

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.on('ready', createWindow)

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow()
    }
  })
}
