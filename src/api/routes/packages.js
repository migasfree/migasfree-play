import express from 'express'
import { pythonExecute, debug } from '../utils.js'

const router = express.Router()

router.get('/available', (req, res) => {
  if (debug) console.log('[express] Getting available packages...')

  let code = `
import json
from migasfree_client.sync import MigasFreeSync
mfs = MigasFreeSync()
mfs.pms_selection()
print(json.dumps(mfs.pms.available_packages()))`
  if (req.query.version.startsWith('4.'))
    code = `
import json
from migasfree_client.client import MigasFreeClient

mfc = MigasFreeClient()
print(json.dumps(mfc.pms.available_packages()))`

  pythonExecute(res, code, 'application/json').then((results) =>
    res.send(results),
  )
})

router.post('/installed', (req, res) => {
  if (debug) console.log('[express] Getting installed packages...')

  const packages = JSON.stringify(req.body)
  let code = `
import json
from migasfree_client.command import MigasFreeCommand

mfc = MigasFreeCommand()
mfc.pms_selection()
installed = []

packages = ${packages}
installed = [pkg for pkg in packages if mfc.pms.is_installed(pkg) and pkg not in installed]

print(json.dumps(installed))`

  if (req.query.version.startsWith('4.'))
    code = `
import json
from migasfree_client.command import MigasFreeCommand

mfc = MigasFreeCommand()
installed = []

packages = ${packages}
installed = [pkg for pkg in packages if mfc.pms.is_installed(pkg) and pkg not in installed]

print(json.dumps(installed))`

  pythonExecute(res, code, 'application/json').then((results) =>
    res.send(results),
  )
})

router.get('/inventory', (req, res) => {
  if (debug) console.log('[express] Getting packages inventory...')

  let code = `
import json
from migasfree_client.command import MigasFreeCommand

mfc = MigasFreeCommand()
mfc.pms_selection()

print(json.dumps(mfc.pms.query_all()))`

  if (req.query.version.startsWith('4.'))
    code = `
import json
from migasfree_client.command import MigasFreeCommand

mfc = MigasFreeCommand()

print(json.dumps(mfc.pms.query_all()))`

  pythonExecute(res, code, 'application/json').then((results) =>
    res.send(results),
  )
})

export default router
