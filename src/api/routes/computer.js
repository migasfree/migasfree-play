const { PythonShell } = require('python-shell')
const express = require('express')
const { pythonShellOptions, debug } = require('../utils')

const router = express.Router()

router.get('/id', (req, res) => {
  if (debug) console.log('[express] Getting computer ID...')

  const code = `
from migasfree_client.command import MigasFreeCommand

print(MigasFreeCommand().get_computer_id())`

  res.setHeader('Content-Type', 'text/plain')
  PythonShell.runString(code, pythonShellOptions)
    .then((results) => {
      res.send(results[0])
    })
    .catch((error) => {
      res.send('0')
    })
})

router.get('/network', (req, res) => {
  if (debug) console.log('[express] Getting network info...')

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

  PythonShell.runString(code, null)
    .then((results) => {
      res.setHeader('Content-Type', 'application/json')
      res.send(results[0])
    })
    .catch((error) => {
      throw error
    })
})

router.post('/register', (req, res) => {
  if (debug) {
    console.log('[express] Registering Computer...')
    console.log('[express] Data', req)
  }

  let code = `
from migasfree_client.command import MigasFreeCommand

mfc = MigasFreeCommand()
mfc._init_command()
mfc._save_sign_keys('${req.body.user}', '${req.body.password}')
mfc._save_computer('${req.body.user}', '${req.body.password}')`

  if (req.query.version.startsWith('4.'))
    code = `
from migasfree_client.command import MigasFreeCommand

mfc = MigasFreeCommand()
mfc._save_sign_keys('${req.body.user}', '${req.body.password}')`

  res.setHeader('Content-Type', 'text/plain')
  PythonShell.runString(code, pythonShellOptions)
    .then((results) => {
      res.send(results[0])
    })
    .catch((error) => {
      res.send('0')
    })
})

module.exports = router
