import path from 'path'
import { ipcMain } from 'electron'
import { pythonExecute, debug, getScriptsPath } from '../python-utils.js'

export default function registerUserHandlers() {
  ipcMain.handle('user:check', async (_, { username, password }) => {
    if (debug) console.log('[ipc] Checking user...')

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
  })
}
