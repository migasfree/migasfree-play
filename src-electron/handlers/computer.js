import { ipcMain } from 'electron'
import { pythonExecute, debug } from '../python-utils.js'

/**
 * Registers IPC handlers related to computer information and registration.
 */
export default function registerComputerHandlers() {
  /**
   * Retrieves the Migasfree computer ID.
   * @returns {Promise<string>} The computer ID or '0' if unavailable.
   */
  ipcMain.handle('computer:get-id', async () => {
    if (debug) console.log('[ipc] Getting computer ID...')

    const code = `
from migasfree_client.command import MigasFreeCommand

print(MigasFreeCommand().get_computer_id())`

    try {
      return await pythonExecute(code)
    } catch (error) {
      if (debug) console.error(error)
      return '0'
    }
  })

  /**
   * Retrieves network information (IP, mask, network CIDR).
   * @returns {Promise<Object>} Network information object.
   * @throws {Error} If network information is unavailable.
   */
  ipcMain.handle('computer:get-network', async () => {
    if (debug) console.log('[ipc] Getting network info...')

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

    try {
      const results = await pythonExecute(code)
      return JSON.parse(results)
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
      // ... (rest of the function remains the same)

      let code = `
from migasfree_client.command import MigasFreeCommand

mfc = MigasFreeCommand()
mfc._init_command()
mfc._save_sign_keys('${user}', '${password}')
mfc._save_computer('${user}', '${password}')`

      if (version.startsWith('4.'))
        code = `
from migasfree_client.command import MigasFreeCommand

mfc = MigasFreeCommand()
mfc._save_sign_keys('${user}', '${password}')`

      try {
        return await pythonExecute(code)
      } catch (error) {
        if (debug) console.error(error)
        return '0'
      }
    },
  )
}
