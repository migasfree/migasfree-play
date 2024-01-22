const { PythonShell } = require('python-shell')
const express = require('express')
const { pythonShellOptions } = require('../utils')

const router = express.Router()

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

  PythonShell.runString(code, pythonShellOptions)
    .then((results) => {
      res.setHeader('Content-Type', 'application/json')
      res.send(results[0])
    })
    .catch((error) => {
      throw error
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

  PythonShell.runString(code, pythonShellOptions)
    .then((results) => {
      res.setHeader('Content-Type', 'application/json')
      res.send(results[0])
    })
    .catch((error) => {
      throw error
    })
})

module.exports = router
