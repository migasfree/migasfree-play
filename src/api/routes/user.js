import express from 'express'
import path from 'path'
import { pythonExecute, debug, getScriptsPath } from '../utils.js'

const router = express.Router()

router.post('/check', async (req, res) => {
  if (debug) console.log('[express] Checking user...')

  const scriptPath = path.join(getScriptsPath(), 'user_check.py')

  try {
    const results = await pythonExecute(
      res,
      scriptPath,
      [req.body.username || '', req.body.password || ''],
      'application/json',
    )
    res.send({ is_privileged: results.trim() === 'True' })
  } catch (error) {
    if (debug) console.error(error)
    res.status(500).json({ is_privileged: false })
  }
})

export default router
