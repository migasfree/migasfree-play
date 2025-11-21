import express from 'express'
import { debug, pythonExecute } from '../utils.js'

const router = express.Router()

const buildCode = (version) => {
  return version.startsWith('4.')
    ? `
import json
from migasfree_client.tags import MigasFreeTags

mft = MigasFreeTags()
response = mft._get_tags()
print(json.dumps({
  "assigned": response["selected"],
  "available": response["available"]
}, ensure_ascii=False))`
    : `
import json
from migasfree_client.tags import MigasFreeTags

mft = MigasFreeTags()
print(json.dumps({
  "assigned": mft.get_assigned_tags(),
  "available": mft.get_available_tags()
}, ensure_ascii=False))`
}

router.get('/', async (req, res) => {
  const version = req.query.version || ''
  if (debug) {
    console.log(`[express] Getting tags (${version})...`)
  }

  const code = buildCode(version)
  try {
    const results = await pythonExecute(res, code, 'application/json')
    res.send(results)
  } catch (error) {
    if (debug) console.error(error)
    res.status(500).json({ assigned: [], available: {} })
  }
})

export default router
