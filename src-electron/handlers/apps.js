import { ipcMain } from 'electron'
import { cliExecute, debug, getClientVersion } from '../python-utils.js'

export default function registerAppsHandlers() {
  ipcMain.handle('apps:get-available', async () => {
    if (debug) console.log(`[ipc] Getting available apps...`)
    try {
      const version = await getClientVersion()
      if (version.startsWith('4.')) {
        return []
      }
      const results = await cliExecute(['--quiet', 'apps', '--json'])
      return JSON.parse(results)
    } catch (error) {
      if (debug) console.error(error)
      return []
    }
  })

  ipcMain.handle('apps:get-categories', async () => {
    if (debug) console.log(`[ipc] Getting app categories...`)
    try {
      const version = await getClientVersion()
      if (version.startsWith('4.')) {
        return []
      }
      const results = await cliExecute(['--quiet', 'categories', '--json'])
      return JSON.parse(results)
    } catch (error) {
      if (debug) console.error(error)
      return []
    }
  })
}
