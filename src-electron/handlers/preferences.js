import os from 'os'
import fs from 'fs'
import path from 'path'
import { ipcMain } from 'electron'
import {
  pythonExecute,
  debug,
  getClientVersion,
  getConfInfo,
} from '../python-utils.js'
import {
  validatePreferencesContent,
  validateVersion,
} from '../ipc-validation.js'

const SETTINGS_FILE = path.resolve(
  os.homedir(),
  '.migasfree-play',
  'settings.json',
)

const DEFAULT_SETTINGS = {
  language: 'es_ES',
  show_language: true,
  show_computer_link: true,
  show_sync_details: false,
  show_apps: true,
  show_devices: true,
  show_tags: true,
  show_details: true,
  show_preferences: true,
  show_info: true,
  show_help: true,
  dark_mode: 'system',
  show_dark_mode: true,
}

const ensureSettingsFile = () => {
  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true })
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2))
  }
}

const readSettings = () => {
  ensureSettingsFile()
  const data = fs.readFileSync(SETTINGS_FILE, 'utf8')
  return data ? JSON.parse(data) : DEFAULT_SETTINGS
}

const writeSettings = (content) => {
  fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true })
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(content, null, 2))
}

export default function registerPreferencesHandlers() {
  ipcMain.handle('preferences:read', () => {
    if (debug) console.log('[ipc] Getting preferences...')
    try {
      return readSettings()
    } catch (error) {
      if (debug) console.error(error)
      throw new Error('Unable to read preferences')
    }
  })

  ipcMain.handle('preferences:write', (_, content) => {
    validatePreferencesContent(content)
    if (debug) console.log('[ipc] Setting preferences...')
    try {
      writeSettings(content)
      return true
    } catch (error) {
      if (debug) console.error(error)
      throw new Error('Unable to save preferences')
    }
  })

  ipcMain.handle('preferences:get-server-info', async () => {
    if (debug) console.log('[ipc] Getting server info...')

    try {
      const version = await getClientVersion()

      if (version.startsWith('4.')) {
        const code = `
import json
from migasfree_client.command import MigasFreeCommand
from migasfree_client.utils import get_hardware_uuid, get_graphic_pid, get_graphic_user

mfc = MigasFreeCommand()
graphic_pid, _ = get_graphic_pid()
server = mfc.migas_server or 'localhost'

ret = {
    'server': server,
    'uuid': get_hardware_uuid(),
    'project': mfc.migas_project,
    'computer_name': mfc.migas_computer_name,
    'user': get_graphic_user(graphic_pid)
}
print(json.dumps(ret))`
        const results = await pythonExecute(code)
        return JSON.parse(results)
      }

      const conf = await getConfInfo()
      return {
        server: conf.server || 'localhost',
        uuid: conf.uuid,
        project: conf.project,
        computer_name: conf.computer_name,
        user: conf.user,
      }
    } catch (error) {
      if (debug) console.error(error)
      throw new Error('Failed to fetch server info')
    }
  })

  ipcMain.handle('preferences:get-client-info', async () => {
    if (debug) console.log('[ipc] Getting client info...')

    try {
      const version = await getClientVersion()
      return { version: version || 'UNKNOWN' }
    } catch (error) {
      if (debug) console.error(error)
      throw new Error('Failed to fetch client info')
    }
  })

  ipcMain.handle('preferences:get-protocol', async (_, { version } = {}) => {
    validateVersion(version)
    if (debug) console.log('[ipc] Getting API protocol...')

    try {
      const actualVersion = version || (await getClientVersion())

      if (actualVersion.startsWith('4.')) {
        const code = `
from migasfree_client.command import MigasFreeCommand
ssl_cert = MigasFreeCommand().migas_ssl_cert
print('https' if ssl_cert else 'http')`
        const results = await pythonExecute(code)
        return results.trim()
      }

      const conf = await getConfInfo()
      return conf.api_protocol
    } catch (error) {
      if (debug) console.error(error)
      throw new Error('Failed to fetch protocol')
    }
  })

  ipcMain.handle('preferences:can-manage-devices', async () => {
    if (debug) console.log('[ipc] Getting manage devices setting...')

    try {
      const version = await getClientVersion()

      if (version.startsWith('4.')) {
        const code = `
from migasfree_client.command import MigasFreeCommand
print(MigasFreeCommand().migas_manage_devices)`
        const results = await pythonExecute(code)
        return results.trim() === 'True'
      }

      const conf = await getConfInfo()
      return (
        conf.manage_devices === true ||
        conf.manage_devices === 'True' ||
        conf.manage_devices === 'true'
      )
    } catch (error) {
      if (debug) console.error(error)
      throw new Error('Failed to fetch device management flag')
    }
  })
}
