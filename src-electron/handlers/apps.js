import { ipcMain } from 'electron'
import { cliExecute, debug } from '../python-utils.js'

export default function registerAppsHandlers() {
  ipcMain.handle('apps:get-available', async (_, { version }) => {
    if (debug) console.log(`[ipc] Getting available apps...`)
    try {
      // Para v4 se mantiene el comportamiento legacy o lo ignoramos,
      // pero como migasfree-play ya exige migasfree-client >= 5.0, vamos directo al cli
      const results = await cliExecute(['--quiet', 'apps', '--json'])
      return JSON.parse(results)
    } catch (error) {
      if (debug) console.error(error)
      return []
    }
  })

  ipcMain.handle('apps:get-categories', async (_, { version }) => {
    if (debug) console.log(`[ipc] Getting app categories...`)
    try {
      const results = await cliExecute(['--quiet', 'categories', '--json'])
      return JSON.parse(results)
    } catch (error) {
      if (debug) console.error(error)
      return []
    }
  })
}
