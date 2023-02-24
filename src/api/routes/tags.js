const { PythonShell } = require('python-shell')
const express = require('express')

const router = express.Router()

const options = { env: { MIGASFREE_CLIENT_DEBUG: 0 } }

router.get('/available', (req, res) => {
  let code = `
import json
from migasfree_client.tags import MigasFreeTags

print(json.dumps(MigasFreeTags().get_available_tags()))`

  if (req.query.version.startsWith('4.'))
    code = `
import json
from migasfree_client.tags import MigasFreeTags

mft = MigasFreeTags()
response = mft._get_tags()
print(json.dumps(response['available'], ensure_ascii=False))`

  PythonShell.runString(code, options, (err, results) => {
    if (err) throw err
    res.setHeader('Content-Type', 'application/json')
    res.send(results[0])
  })
})

router.get('/assigned', (req, res) => {
  let code = `
import json
from migasfree_client.tags import MigasFreeTags

print(json.dumps(MigasFreeTags().get_assigned_tags()))`

  if (req.query.version.startsWith('4.'))
    code = `
import json
from migasfree_client.tags import MigasFreeTags

mft = MigasFreeTags()
response = mft._get_tags()
print(json.dumps(response['selected'], ensure_ascii=False))`

  PythonShell.runString(code, options, (err, results) => {
    if (err) throw err
    res.setHeader('Content-Type', 'application/json')
    res.send(results[0])
  })
})

module.exports = router
