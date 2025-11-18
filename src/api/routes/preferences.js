import os from 'os'
import fs from 'fs'
import path from 'node:path'
import express from 'express'
import { pythonExecute, debug } from '../utils.js'

const SETTINGS_FILE = path.resolve(
  os.homedir(),
  '.migasfree-play',
  'settings.json',
)
const router = express.Router()

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

router.get('/', (req, res) => {
  if (debug) console.log('[express] Getting preferences...')

  try {
    const settings = readSettings()
    res.status(200).json(settings)
  } catch (error) {
    if (debug) console.error(error)
    res.status(500).json({ error: 'Unable to read preferences' })
  }
})

router.post('/', (req, res) => {
  if (debug) console.log('[express] Setting preferences...')

  try {
    writeSettings(req.body)
    res.sendStatus(201)
  } catch (error) {
    if (debug) console.error(error)
    res.status(500).json({ error: 'Unable to save preferences' })
  }
})

router.get('/server', async (req, res) => {
  if (debug) console.log('[express] Getting server info...')

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
    const results = await pythonExecute(res, code, 'application/json')
    res.type('application/json').send(results)
  } catch (error) {
    if (debug) console.error(error)
    res.status(500).json({ error: 'Failed to fetch server info' })
  }
})

router.get('/client', async (req, res) => {
  if (debug) console.log('[express] Getting client info...')

  const code = `
import json
from migasfree_client.utils import get_mfc_release

ret = {'version': get_mfc_release()}
print(json.dumps(ret))`

  try {
    const results = await pythonExecute(res, code)
    res.type('application/json').send(results)
  } catch (error) {
    if (debug) console.error(error)
    res.status(500).json({ error: 'Failed to fetch client info' })
  }
})

router.get('/protocol', async (req, res) => {
  if (debug) console.log('[express] Getting API protocol...')

  let code = `
from migasfree_client.command import MigasFreeCommand
print(MigasFreeCommand().api_protocol())`
  if (req.query.version?.startsWith('4.')) {
    code = `
from migasfree_client.command import MigasFreeCommand
ssl_cert = MigasFreeCommand().migas_ssl_cert
print('https' if ssl_cert else 'http')`
  }

  try {
    const results = await pythonExecute(res, code)
    res.send(results)
  } catch (error) {
    if (debug) console.error(error)
    res.status(500).json({ error: 'Failed to fetch protocol' })
  }
})

router.get('/manage-devices', async (req, res) => {
  if (debug) console.log('[express] Getting manage devices setting...')

  const code = `
from migasfree_client.command import MigasFreeCommand
print(MigasFreeCommand().migas_manage_devices)`

  try {
    const results = await pythonExecute(res, code)
    res.json(results.trim() === 'True')
  } catch (error) {
    if (debug) console.error(error)
    res.status(500).json({ error: 'Failed to fetch device management flag' })
  }
})

export default router
