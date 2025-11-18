import express from 'express'
import { pythonExecute } from '../utils.js'

const router = express.Router()

const buildCode = (action, version) => {
  return version.startsWith('4.')
    ? `
import json
from migasfree_client.tags import MigasFreeTags

mft = MigasFreeTags()
response = mft._get_tags()
print(json.dumps(response['${action}'], ensure_ascii=False))`
    : `
import json
from migasfree_client.tags import MigasFreeTags

print(json.dumps(MigasFreeTags().${action === 'available' ? 'get_available_tags' : 'get_assigned_tags'}()))`
}

const handleTag = async (req, res, action) => {
  try {
    const code = buildCode(action, req.query.version || '')
    const results = await pythonExecute(res, code, 'application/json')
    res.send(results)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to execute Python code' })
  }
}

router.get('/available', (req, res) => handleTag(req, res, 'available'))
router.get('/assigned', (req, res) => handleTag(req, res, 'selected'))

export default router
