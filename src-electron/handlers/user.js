import path from 'path'
import { ipcMain } from 'electron'
import {
  cliExecute,
  pythonExecute,
  debug,
  getScriptsPath,
} from '../python-utils.js'

/**
 * Registers IPC handlers related to user actions.
 */
export default function registerUserHandlers() {
  /**
   * Checks if the given user has privileged access.
   * @param {Object} _ - Unused event object.
   * @param {Object} params - Parameters.
   * @param {string} params.username - The username to check.
   * @param {string} params.password - The password for verification.
   * @param {string} params.version - Client/Server version for compatibility.
   * @returns {Promise<Object>} Object containing the privilege status.
   */
  ipcMain.handle('user:check', async (_, { username, password, version }) => {
    if (debug) console.log('[ipc] Checking user...')

    if (version && version.startsWith('4.')) {
      const scriptPath = path.join(getScriptsPath(), 'user_check.py')
      try {
        const results = await pythonExecute(scriptPath, [
          username || '',
          password || '',
        ])
        return { is_privileged: (results || '').trim() === 'True' }
      } catch (error) {
        if (debug) console.error(error)
        return { is_privileged: false }
      }
    }

    try {
      const results = await cliExecute([
        '--quiet',
        'user-check',
        '--user',
        username || '',
        '--pwd',
        password || '',
      ])
      const data = JSON.parse(results)
      return { is_privileged: data.is_privileged === true }
    } catch (error) {
      if (debug) console.error(error)
      return { is_privileged: false }
    }
  })
}
