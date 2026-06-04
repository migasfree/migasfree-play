import { ipcMain } from 'electron'
import {
  pythonExecute,
  cliExecute,
  debug,
  getClientVersion,
  clearConfCache,
} from '../python-utils.js'

/**
 * Robustly parses JSON from terminal outputs, ignoring leading/trailing noise
 */
const parseJsonSafe = (str) => {
  if (!str) return null
  const trimmed = str.trim()
  const startBrace = trimmed.indexOf('{')
  const startBracket = trimmed.indexOf('[')

  let start = -1
  let end = -1

  if (startBrace !== -1 && (startBracket === -1 || startBrace < startBracket)) {
    start = startBrace
    end = trimmed.lastIndexOf('}')
  } else if (startBracket !== -1) {
    start = startBracket
    end = trimmed.lastIndexOf(']')
  }

  if (start === -1 || end === -1 || end < start) {
    throw new Error('No valid JSON structure found in output: ' + str)
  }

  const jsonString = trimmed.substring(start, end + 1)
  return JSON.parse(jsonString)
}

/**
 * Registers IPC handlers related to computer information and registration.
 */
export default function registerComputerHandlers() {
  /**
   * Retrieves the Migasfree computer label info.
   * @returns {Promise<Object>} The computer label data.
   */
  ipcMain.handle('computer:get-info', async () => {
    if (debug) console.log('[ipc] Getting computer info...')

    try {
      const result = await cliExecute(['--quiet', 'info', '--json'])
      return parseJsonSafe(result)
    } catch (error) {
      if (debug) console.error(error)
      throw new Error('Computer info unavailable')
    }
  })

  /**
   * Retrieves the Migasfree computer ID.
   * @returns {Promise<string>} The computer ID or '0' if unavailable.
   */
  ipcMain.handle('computer:get-id', async () => {
    if (debug) console.log('[ipc] Getting computer ID...')

    try {
      const result = await cliExecute(['--quiet', 'info', 'id'])
      return result ? result.trim() : '0'
    } catch (error) {
      if (debug) console.error(error)
      return '0'
    }
  })

  /**
   * Retrieves the CID attribute via safe client command.
   * @returns {Promise<Object>} The CID attribute.
   */
  ipcMain.handle('computer:get-cid-attribute', async () => {
    if (debug) console.log('[ipc] Getting computer attributes...')

    try {
      const result = await cliExecute([
        '--quiet',
        'attributes',
        '--cid',
        '--json',
      ])
      return parseJsonSafe(result)
    } catch (error) {
      if (debug) console.error(error)
      throw new Error('Computer attributes unavailable')
    }
  })

  /**
   * Retrieves the assigned attributes via safe client command.
   * @returns {Promise<Object>} The assigned attributes.
   */
  ipcMain.handle('computer:get-assigned-attributes', async () => {
    if (debug) console.log('[ipc] Getting computer assigned attributes...')

    try {
      const result = await cliExecute(['--quiet', 'attributes', '--json'])
      return parseJsonSafe(result)
    } catch (error) {
      if (debug) console.error(error)
      throw new Error('Computer assigned attributes unavailable')
    }
  })

  /**
   * Retrieves network information (IP, mask, network CIDR).
   * @returns {Promise<Object>} Network information object.
   * @throws {Error} If network information is unavailable.
   */
  ipcMain.handle('computer:get-network', async () => {
    if (debug) console.log('[ipc] Getting network info...')

    try {
      const version = await getClientVersion()

      if (version.startsWith('4.')) {
        const code = `
import json
from migasfree_client.network import get_iface_net, get_iface_cidr, get_iface_mask, get_iface_address, get_ifname
_ifname = get_ifname()
ret = {
    'network': '{}/{}'.format(get_iface_net(_ifname), get_iface_cidr(_ifname)),
    'mask': get_iface_mask(_ifname),
    'ip_address': get_iface_address(_ifname)
}
print(json.dumps(ret))`
        const results = await pythonExecute(code)
        return parseJsonSafe(results)
      }

      const results = await cliExecute(['--quiet', 'network', '--json'])
      return parseJsonSafe(results)
    } catch (error) {
      if (debug) console.error(error)
      throw new Error('Network info unavailable')
    }
  })

  /**
   * Registers the computer with the Migasfree server.
   * @param {Object} _ - Unused event object.
   * @param {Object} params - Registration parameters.
   * @param {string} params.user - Username for authentication.
   * @param {string} params.password - Password for authentication.
   * @param {string} params.version - Client/Server version for compatibility.
   * @returns {Promise<string>} Execution result.
   */
  ipcMain.handle(
    'computer:register',
    async (_, { user, password, version }) => {
      if (debug) console.log('[ipc] Registering Computer...')

      try {
        if (version.startsWith('4.')) {
          const code = `
from migasfree_client.command import MigasFreeCommand

mfc = MigasFreeCommand()
mfc._save_sign_keys('${user}', '${password}')`
          return await pythonExecute(code)
        }

        // For v5, we use the non-interactive CLI flags
        await cliExecute([
          '--quiet',
          'register',
          '--assume-yes',
          '--user',
          user,
          '--password',
          password,
        ])
        clearConfCache()
        return '1' // Registration success equivalent
      } catch (error) {
        if (debug) console.error(error)
        return '0' // Failure equivalent
      }
    },
  )
}
