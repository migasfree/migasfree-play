import path from 'path'
import { ipcMain } from 'electron'
import {
  cliExecute,
  pythonExecute,
  debug,
  getScriptsPath,
} from '../python-utils.js'

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

    if (version && version.startsWith('4.')) {
      const scriptPath = path.join(getScriptsPath(), 'packages_available_v4.py')
      try {
        const results = await pythonExecute(scriptPath, [])
        return JSON.parse(results)
      } catch (error) {
        if (debug) console.error(error)
        return []
      }
    }

    try {
      const results = await cliExecute(['--quiet', 'packages', '--available'])
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

    if (version && version.startsWith('4.')) {
      const packagesJson = JSON.stringify(packages)
      const scriptPath = path.join(getScriptsPath(), 'packages_installed.py')
      try {
        const results = await pythonExecute(scriptPath, [packagesJson])
        return JSON.parse(results)
      } catch (error) {
        if (debug) console.error(error)
        return []
      }
    }

    try {
      const packagesJson = JSON.stringify(packages || [])
      const results = await cliExecute([
        '--quiet',
        'packages',
        '--check',
        packagesJson,
      ])
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

    if (version && version.startsWith('4.')) {
      const scriptPath = path.join(getScriptsPath(), 'packages_inventory.py')
      try {
        const results = await pythonExecute(scriptPath, [])
        return JSON.parse(results)
      } catch (error) {
        if (debug) console.error(error)
        return []
      }
    }

    try {
      const results = await cliExecute(['--quiet', 'packages', '--installed'])
      return JSON.parse(results)
    } catch (error) {
      if (debug) console.error(error)
      return []
    }
  })
}
