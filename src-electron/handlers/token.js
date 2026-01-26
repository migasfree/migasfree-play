import os from 'os'
import fs from 'fs'
import path from 'path'
import { ipcMain } from 'electron'
import { debug } from '../python-utils.js'

const tokenFile = path.join(os.homedir(), '.migasfree-play', 'token')

export default function registerTokenHandlers() {
  ipcMain.handle('token:read', async () => {
    if (debug) console.log('[ipc] Reading token file...')

    try {
      const token = fs.existsSync(tokenFile)
        ? await fs.promises.readFile(tokenFile, 'utf8')
        : ''
      return token
    } catch (error) {
      if (debug) console.error(error)
      throw new Error('Failed to read token')
    }
  })

  ipcMain.handle('token:write', async (_, { token }) => {
    if (debug) console.log('[ipc] Writing token file...')

    if (typeof token !== 'string') {
      throw new Error('Invalid token')
    }

    try {
      await fs.promises.mkdir(path.dirname(tokenFile), { recursive: true })
      await fs.promises.writeFile(tokenFile, token)
      return true
    } catch (error) {
      if (debug) console.error(error)
      throw new Error('Failed to write token')
    }
  })

  ipcMain.handle('token:request', async (_, { url, username, password }) => {
    if (debug) console.log(`[ipc] Requesting token from ${url}`)

    try {
      // Dynamic import because axios is an EcoModule and might be ESM
      const axios = (await import('axios')).default

      const response = await axios.post(url, {
        username,
        password,
      })

      return response.data
    } catch (error) {
      if (debug) console.error('Token request failed:', error.message)

      // Return error structure similar to axios error for consistency
      if (error.response) {
        throw {
          response: {
            status: error.response.status,
            data: error.response.data,
          },
          message: error.message,
        }
      }
      throw error
    }
  })
}
