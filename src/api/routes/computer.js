const { PythonShell } = require('python-shell')
const express = require('express')
const { pythonShellOptions, debug } = require('../utils')

const router = express.Router()

router.get('/id', (req, res) => {
  if (debug) console.log('[express] Getting computer ID...')

  const code = `
from migasfree_client.command import MigasFreeCommand

print(MigasFreeCommand().get_computer_id())`

  PythonShell.runString(code, pythonShellOptions, (err, results) => {
    res.setHeader('Content-Type', 'text/plain')
    if (err) res.send('0')
    else res.send(results[0])
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

  PythonShell.runString(code, null, (err, results) => {
    if (err) throw err
    res.setHeader('Content-Type', 'application/json')
    res.send(results[0])
  })
})

router.post('/register', (req, res) => {
  if (debug) console.log('[express] Registering Computer...')
  console.log(req.query.version)
  console.log(req.body)

  const code = `
from migasfree_client.command import MigasFreeCommand

mfc = MigasFreeCommand()
mfc._init_command()
mfc._save_sign_keys('${req.body.user}', '${req.body.password}')
mfc._save_computer('${req.body.user}', '${req.body.password}')`

  if (req.query.version.startsWith('4.')) code = 'TODO'

  PythonShell.runString(code, pythonShellOptions, (err, results) => {
    if (err) throw err
    res.setHeader('Content-Type', 'text/plain')
    res.send(results[0])
  })
})

module.exports = router
