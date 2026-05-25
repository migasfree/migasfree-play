import { ipcMain } from 'electron'
import { cliExecute, debug } from '../python-utils.js'

export default function registerDevicesHandlers() {
  ipcMain.handle('devices:get-available', async () => {
    if (debug) console.log(`[ipc] Getting available devices...`)
    try {
      const results = await cliExecute([
        '--quiet',
        'devices',
        '--available',
        '--json',
      ])
      return JSON.parse(results)
    } catch (error) {
      if (debug) console.error(error)
      return []
    }
  })

  ipcMain.handle('devices:get-logical', async (_, { deviceId }) => {
    if (debug) console.log(`[ipc] Getting logical devices...`)
    try {
      const args = ['--quiet', 'devices', '--logical', '--json']
      if (deviceId) {
        args.push('--device-id', deviceId.toString())
      }
      const results = await cliExecute(args)
      return JSON.parse(results)
    } catch (error) {
      if (debug) console.error(error)
      return { results: [] }
    }
  })

  ipcMain.handle('devices:get-assigned', async () => {
    if (debug) console.log(`[ipc] Getting assigned devices...`)
    try {
      const results = await cliExecute(['--quiet', 'devices', '--json'])
      return JSON.parse(results)
    } catch (error) {
      if (debug) console.error(error)
      return {
        assigned_logical_devices_to_cid: [],
        inflicted_logical_devices: [],
      }
    }
  })
}
