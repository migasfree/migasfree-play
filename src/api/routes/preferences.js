const { PythonShell } = require('python-shell')
const os = require('os')
const fs = require('fs')
const path = require('path')
const express = require('express')

const filePath = path.join(os.homedir(), '.migasfree-play', 'settings.json')
const router = express.Router()

const options = { env: { MIGASFREE_CLIENT_DEBUG: 0 } }

const settings = {
  language: 'es_ES',
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

router.get('/', (req, res) => {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8')

    if (data) res.json(JSON.parse(data))
    else res.json(settings)
  } else {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, JSON.stringify(settings, null, 2))
    res.json(settings)
  }
})

router.post('/', (req, res) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2))
  res.send()
})

router.get('/server', (req, res) => {
  const code = `
import json
from migasfree_client import settings
from migasfree_client.utils import get_config, get_hardware_uuid, \
get_mfc_project, get_mfc_computer_name, get_graphic_pid, get_graphic_user

graphic_pid, graphic_process = get_graphic_pid()
ret = {
    'server': get_config(settings.CONF_FILE, 'client').get('server', 'localhost'),
    'uuid': get_hardware_uuid(),
    'project': get_mfc_project(),
    'computer_name': get_mfc_computer_name(),
    'user': get_graphic_user(graphic_pid)
}
print(json.dumps(ret))`

  PythonShell.runString(code, null, (err, results) => {
    if (err) throw err
    res.setHeader('Content-Type', 'application/json')
    res.send(results[0])
  })
})

router.get('/client', (req, res) => {
  const code = `
import json
from migasfree_client.utils import get_mfc_release

ret = {'version': get_mfc_release()}
print(json.dumps(ret))`

  PythonShell.runString(code, options, (err, results) => {
    if (err) throw err
    res.setHeader('Content-Type', 'text/plain')
    res.send(results[0])
  })
})

router.get('/protocol', (req, res) => {
  let code = `
from migasfree_client.command import MigasFreeCommand

print(MigasFreeCommand().api_protocol())`

  if (req.query.version.startsWith('4.')) {
    code = `
from migasfree_client.command import MigasFreeCommand

ssl_cert = MigasFreeCommand().migas_ssl_cert
print('https' if ssl_cert else 'http')`
  }

  PythonShell.runString(code, options, (err, results) => {
    if (err) throw err
    res.setHeader('Content-Type', 'text/plain')
    res.send(results[0])
  })
})

module.exports = router
