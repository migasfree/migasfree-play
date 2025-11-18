import express from 'express'
import { pythonExecute, debug } from '../utils.js'

const router = express.Router()

router.get('/id', async (req, res) => {
  if (debug) console.log('[express] Getting computer ID...')

  const code = `
from migasfree_client.command import MigasFreeCommand

print(MigasFreeCommand().get_computer_id())`

  try {
    const results = await pythonExecute(res, code)
    res.send(results)
  } catch (error) {
    if (debug) console.error(error)
    res.type('text/plain').send('0')
  }
})

router.get('/network', async (req, res) => {
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

  try {
    const results = await pythonExecute(res, code, 'application/json')
    res.type('application/json').send(results)
  } catch (error) {
    if (debug) console.error(error)
    res.status(500).send('Network info unavailable')
  }
})

router.post('/register', async (req, res) => {
  if (debug) {
    console.log('[express] Registering Computer...')
    console.log('[express] Data', req)
  }

  const { user, password } = req.body
  const version = req.query.version || ''

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
mfc._save_sign_keys('${req.body.user}', '${req.body.password}')`

  try {
    const results = await pythonExecute(res, code)
    res.send(results)
  } catch (error) {
    if (debug) console.error(error)
    res.type('text/plain').send('0')
  }
})

export default router
