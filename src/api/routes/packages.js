const { PythonShell } = require('python-shell')
const express = require('express')

const router = express.Router()

router.get('/available', (req, res) => {
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

  PythonShell.runString(code, null, (err, results) => {
    if (err) throw err
    res.setHeader('Content-Type', 'application/json')
    res.send(results[0])
  })
})

router.post('/installed', (req, res) => {
  const packages = JSON.stringify(req.body)
  let code = `
import json
from migasfree_client.command import MigasFreeCommand

mfc = MigasFreeCommand()
mfc.pms_selection()
installed = []

packages = ${packages}
for pkg in packages:
    if mfc.pms.is_installed(pkg):
        if pkg not in installed:
            installed.append(pkg)

print(json.dumps(installed))`

  if (req.query.version.startsWith('4.'))
    code = `
import json
from migasfree_client.command import MigasFreeCommand

mfc = MigasFreeCommand()
installed = []

packages = ${packages}
for pkg in packages:
    if mfc.pms.is_installed(pkg):
        if pkg not in installed:
            installed.append(pkg)

print(json.dumps(installed))`

  PythonShell.runString(code, null, (err, results) => {
    if (err) throw err
    res.setHeader('Content-Type', 'application/json')
    res.send(results[0])
  })
})

module.exports = router
