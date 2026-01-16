import os from 'os'
import fs from 'fs'
import path from 'path'
import { ipcMain } from 'electron'
import { pythonExecute, debug } from '../python-utils.js'

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
  dark_mode: false,
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

    const code = `
import json
from migasfree_client import settings
from migasfree_client.utils import (
    get_config, get_hardware_uuid,
    get_mfc_project, get_mfc_computer_name,
    get_graphic_pid, get_graphic_user
)

graphic_pid, graphic_process = get_graphic_pid()
ret = {
    'server': get_config(settings.CONF_FILE, 'client').get('server', 'localhost'),
    'uuid': get_hardware_uuid(),
    'project': get_mfc_project(),
    'computer_name': get_mfc_computer_name(),
    'user': get_graphic_user(graphic_pid)
}
print(json.dumps(ret))`

    try {
      const results = await pythonExecute(code)
      return JSON.parse(results)
    } catch (error) {
      if (debug) console.error(error)
      throw new Error('Failed to fetch server info')
    }
  })

  ipcMain.handle('preferences:get-client-info', async () => {
    if (debug) console.log('[ipc] Getting client info...')

    const code = `
import json
from migasfree_client.utils import get_mfc_release

ret = {'version': get_mfc_release()}
print(json.dumps(ret))`

    try {
      const results = await pythonExecute(code)
      return JSON.parse(results)
    } catch (error) {
      if (debug) console.error(error)
      throw new Error('Failed to fetch client info')
    }
  })

  ipcMain.handle('preferences:get-protocol', async (_, { version }) => {
    if (debug) console.log('[ipc] Getting API protocol...')

    let code = `
from migasfree_client.command import MigasFreeCommand
print(MigasFreeCommand().api_protocol())`

    if (version?.startsWith('4.')) {
      code = `
from migasfree_client.command import MigasFreeCommand
ssl_cert = MigasFreeCommand().migas_ssl_cert
print('https' if ssl_cert else 'http')`
    }

    try {
      return await pythonExecute(code)
    } catch (error) {
      if (debug) console.error(error)
      throw new Error('Failed to fetch protocol')
    }
  })

  ipcMain.handle('preferences:can-manage-devices', async () => {
    if (debug) console.log('[ipc] Getting manage devices setting...')

    const code = `
from migasfree_client.command import MigasFreeCommand
print(MigasFreeCommand().migas_manage_devices)`

    try {
      const results = await pythonExecute(code)
      return results.trim() === 'True'
    } catch (error) {
      if (debug) console.error(error)
      throw new Error('Failed to fetch device management flag')
    }
  })
}
