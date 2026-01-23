import path from 'path'
import { ipcMain } from 'electron'
import { pythonExecute, debug, getScriptsPath } from '../python-utils.js'

/**
 * Registers IPC handlers related to package management.
 */
export default function registerPackagesHandlers() {
  /**
   * Retrieves available packages from the server.
   * @param {Object} _ - Unused event object.
   * @param {Object} params - Parameters.
   * @param {string} params.version - Client/Server version for compatibility.
   * @returns {Promise<Array>} List of available packages.
   */
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

  /**
   * Retrieves information about installed packages.
   * @param {Object} _ - Unused event object.
   * @param {Object} params - Parameters.
   * @param {Array} params.packages - List of packages to check.
   * @param {string} params.version - Client/Server version for compatibility.
   * @returns {Promise<Array>} List of installed packages with details.
   */
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

  /**
   * Retrieves the package inventory from the local system.
   * @param {Object} _ - Unused event object.
   * @param {Object} params - Parameters.
   * @param {string} params.version - Client/Server version for compatibility.
   * @returns {Promise<Array>} List of local inventory packages.
   */
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
