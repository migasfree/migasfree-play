import os from 'os'
import fs from 'fs'
import path from 'node:path'
import express from 'express'
import { debug } from '../utils.js'

const filePath = path.join(os.homedir(), '.migasfree-play', 'executions.json')
const router = express.Router()

router.get('/', async (req, res) => {
  if (debug) console.log('[express] Reading executions file...')

  try {
    if (fs.existsSync(filePath)) {
      const data = await fs.promises.readFile(filePath, 'utf8')
      res.status(200).json(data ? JSON.parse(data) : {})
    } else {
      res.status(200).json({})
    }
  } catch (error) {
    if (debug) console.error('[express] Error reading executions file:', error)
    res.status(500).json({ error: 'Failed to read executions file' })
  }
})

router.post('/', async (req, res) => {
  if (debug) console.log('[express] Writing executions file...')

  try {
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true })
    await fs.promises.writeFile(filePath, JSON.stringify(req.body, null, 2))
    res.sendStatus(200)
  } catch (error) {
    if (debug) console.error('[express] Error writing executions file:', error)
    res.status(500).json({ error: 'Failed to write executions file' })
  }
})

export default router
