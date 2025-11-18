import os from 'os'
import fs from 'fs'
import path from 'node:path'
import express from 'express'
import { debug } from '../utils.js'

const tokenFile = path.join(os.homedir(), '.migasfree-play', 'token')
const router = express.Router()

router.get('/', async (req, res) => {
  if (debug) console.log('[express] Reading token file...')

  try {
    const token = fs.existsSync(tokenFile)
      ? await fs.promises.readFile(tokenFile, 'utf8')
      : ''
    res.json({ token })
  } catch (error) {
    if (debug) console.error(error)
    res.status(500).json({ error: 'Failed to read token' })
  }
})

router.post('/', async (req, res) => {
  if (debug) {
    console.log('[express] Writing token file...')
    console.log(req.body)
  }

  const { token } = req.body ?? {}
  if (typeof token !== 'string' || token.trim() === '') {
    return res.status(400).json({ error: 'Invalid token' })
  }

  try {
    await fs.promises.mkdir(path.dirname(tokenFile), { recursive: true })
    await fs.promises.writeFile(tokenFile, token)
    res.sendStatus(201)
  } catch (error) {
    if (debug) console.error(error)
    res.status(500).json({ error: 'Failed to write token' })
  }
})

export default router
