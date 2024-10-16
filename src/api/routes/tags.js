const express = require('express')
const { pythonExecute } = require('../utils')

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

  pythonExecute(res, code, 'application/json').then((results) =>
    res.send(results),
  )
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

  pythonExecute(res, code, 'application/json').then((results) =>
    res.send(results),
  )
})

module.exports = router
