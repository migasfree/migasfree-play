const tcpPortUsed = require('tcp-port-used')
const path = require('path')
const spawn = require('child_process').spawn

let expressProcess = undefined

function launchExpress() {
  const isProduction = process.env.NODE_ENV === 'production'

  tcpPortUsed.check(3000, '127.0.0.1').then(
    function(inUse) {
      console.log('Port 3000 usage: ' + inUse) // debug
      if (!inUse) {
        const expressApi = isProduction
          ? path.join(__dirname, '..', 'app.asar.unpacked', 'api.js')
          : path.join(__dirname, '..', '..', 'src', 'api')

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
    function(err) {
      console.error('Error on check:', err.message)
    }
  )
}

import { app, BrowserWindow, nativeTheme, Menu } from 'electron'
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

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = __dirname
}

let mainWindow

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__statics, 'img', 'migasfree-play.png'),
    width: 800,
    height: 800,
    useContentSize: true,
    webPreferences: {
      // Change from /quasar.conf.js > electron > nodeIntegration;
      // More info: https://quasar.dev/quasar-cli/developing-electron-apps/node-integration
      nodeIntegration: process.env.QUASAR_NODE_INTEGRATION,
      nodeIntegrationInWorker: process.env.QUASAR_NODE_INTEGRATION,
      enableRemoteModule: true

      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      // preload: path.resolve(__dirname, 'electron-preload.js')
    }
  })

  launchExpress()

  mainWindow.webContents.session.setProxy({ mode: 'system' })

  mainWindow.loadURL(process.env.APP_URL)

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

  mainWindow.on('close', (e) => {
    if (!app.canExit) e.preventDefault() // Prevents the window from closing
  })
  Menu.setApplicationMenu(null)
}

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
