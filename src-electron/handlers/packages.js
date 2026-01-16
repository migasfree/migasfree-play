import path from 'path'
import { ipcMain } from 'electron'
import { pythonExecute, debug, getScriptsPath } from '../python-utils.js'

export default function registerPackagesHandlers() {
  ipcMain.handle('packages:get-available', async (_, { version }) => {
    if (debug) console.log('[ipc] Getting available packages...')

    let scriptName = 'packages_available.py'
    if (version.startsWith('4.')) scriptName = 'packages_available_v4.py'

    const scriptPath = path.join(getScriptsPath(), scriptName)

    try {
      const results = await pythonExecute(scriptPath, [])
      return JSON.parse(results)
    } catch (error) {
      if (debug) console.error(error)
      return []
    }
  })

  ipcMain.handle('packages:get-installed', async (_, { packages, version }) => {
    if (debug) console.log('[ipc] Getting installed packages...')

    const packagesJson = JSON.stringify(packages)
    const args = [packagesJson]
    if (version.startsWith('4.')) args.unshift('--legacy')

    const scriptPath = path.join(getScriptsPath(), 'packages_installed.py')

    try {
      const results = await pythonExecute(scriptPath, args)
      return JSON.parse(results)
    } catch (error) {
      if (debug) console.error(error)
      return []
    }
  })

  ipcMain.handle('packages:get-inventory', async (_, { version }) => {
    if (debug) console.log('[ipc] Getting packages inventory...')

    const args = []
    if (version.startsWith('4.')) args.unshift('--legacy')

    const scriptPath = path.join(getScriptsPath(), 'packages_inventory.py')

    try {
      const results = await pythonExecute(scriptPath, args)
      return JSON.parse(results)
    } catch (error) {
      if (debug) console.error(error)
      return []
    }
  })
}
