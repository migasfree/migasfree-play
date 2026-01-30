import os from 'os'
import fs from 'fs'
import path from 'path'
import { ipcMain } from 'electron'
import { pythonExecute, debug } from '../python-utils.js'

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
      const axios = (await import('axios')).default
      const https = await import('https')
      const { URL } = await import('url')

      let caPath = null
      let caContent = null

      // 1. Try to get system CA via Python (migasfree-client v5)
      const pythonCode = `
import os
import sys

try:
    from migasfree_client.utils import get_config
    from migasfree_client import settings
    from migasfree_client.mtls import get_mtls_ca_file
    
    server = get_config(settings.CONF_FILE, 'client').get('server', 'localhost')
    ca_file = get_mtls_ca_file(server)

    if os.path.exists(ca_file):
        print(ca_file)
except ImportError:
    pass
except Exception as e:
    print(str(e), file=sys.stderr)
`
      try {
        const systemCaPath = await pythonExecute(pythonCode)
        if (systemCaPath && fs.existsSync(systemCaPath)) {
          if (debug) console.log(`[ipc] Using System CA file: ${systemCaPath}`)
          caPath = systemCaPath
        }
      } catch (error) {
        if (debug) console.error('Failed to get System CA file:', error)
      }

      // 2. If no System CA, check Local User Cache & Server Discovery
      if (!caPath) {
        try {
          const hostname = new URL(url).hostname
          const localMtlsDir = path.join(
            os.homedir(),
            '.migasfree-play',
            'mtls',
            hostname,
          )
          const localCaPath = path.join(localMtlsDir, 'ca.pem')

          if (fs.existsSync(localCaPath)) {
            if (debug)
              console.log(`[ipc] Using Local Cached CA file: ${localCaPath}`)
            caPath = localCaPath
          } else {
            // 3. Attempt Server Discovery (Bootstrap)
            const caUrl = `${new URL(url).origin}/manager/v1/public/ca`
            if (debug) console.log(`[ipc] Attempting to fetch CA from ${caUrl}`)

            try {
              // Bootstrap request: ignore SSL errors because we don't have the CA yet
              const bootstrapAgent = new https.Agent({
                rejectUnauthorized: false,
              })
              const caResponse = await axios.get(caUrl, {
                httpsAgent: bootstrapAgent,
              })

              if (caResponse.status === 200 && caResponse.data) {
                if (debug)
                  console.log(`[ipc] Caching discovered CA to ${localCaPath}`)

                await fs.promises.mkdir(localMtlsDir, { recursive: true })
                await fs.promises.writeFile(localCaPath, caResponse.data)

                caPath = localCaPath
              }
            } catch (fetchError) {
              if (debug)
                console.warn(
                  '[ipc] CA Discovery failed (likely v4 server or network issue):',
                  fetchError.message,
                )
            }
          }
        } catch (err) {
          if (debug) console.error('[ipc] Error in CA discovery logic:', err)
        }
      }

      // Prepare HTTPS Agent if we found a CA
      let httpsAgent = null
      if (caPath) {
        try {
          caContent = fs.readFileSync(caPath)
          httpsAgent = new https.Agent({ ca: caContent })
        } catch (readError) {
          if (debug) console.error('[ipc] Failed to read CA file:', readError)
        }
      }

      const data = {
        username,
        password,
      }

      const config = {}
      if (httpsAgent) {
        config.httpsAgent = httpsAgent
      }

      const response = await axios.post(url, data, config)

      return response.data
    } catch (error) {
      if (debug) console.error('Token request failed:', error.message)

      if (error.response) {
        throw new Error(
          JSON.stringify({
            status: error.response.status,
            data: error.response.data,
            message: error.message,
          }),
        )
      }
      throw new Error(error.message)
    }
  })
}
