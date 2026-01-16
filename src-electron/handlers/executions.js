import os from 'os'
import fs from 'fs'
import path from 'path'
import { ipcMain } from 'electron'
import { debug } from '../python-utils.js'

const filePath = path.join(os.homedir(), '.migasfree-play', 'executions.json')

export default function registerExecutionsHandlers() {
  ipcMain.handle('executions:read', async () => {
    if (debug) console.log('[ipc] Reading executions file...')

    try {
      if (fs.existsSync(filePath)) {
        const data = await fs.promises.readFile(filePath, 'utf8')
        return data ? JSON.parse(data) : {}
      } else {
        return {}
      }
    } catch (error) {
      if (debug) console.error('[ipc] Error reading executions file:', error)
      throw new Error('Failed to read executions file')
    }
  })

  ipcMain.handle('executions:write', async (_, data) => {
    if (debug) console.log('[ipc] Writing executions file...')

    try {
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true })
      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2))
      return true
    } catch (error) {
      if (debug) console.error('[ipc] Error writing executions file:', error)
      throw new Error('Failed to write executions file')
    }
  })
}
