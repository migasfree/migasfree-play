import express from 'express'
import path from 'path'
import { pythonExecute, debug, getScriptsPath } from '../utils.js'

const router = express.Router()

router.get('/available', async (req, res) => {
  if (debug) console.log('[express] Getting available packages...')

  let scriptName = 'packages_available.py'
  if (req.query.version.startsWith('4.'))
    scriptName = 'packages_available_v4.py'

  const scriptPath = path.join(getScriptsPath(), scriptName)

  try {
    const results = await pythonExecute(res, scriptPath, [], 'application/json')
    res.send(results)
  } catch (error) {
    if (debug) console.error(error)
    res.status(500).json([])
  }
})

router.post('/installed', async (req, res) => {
  if (debug) console.log('[express] Getting installed packages...')

  const packages = JSON.stringify(req.body)
  const args = [packages]
  if (req.query.version.startsWith('4.')) args.unshift('--legacy')

  const scriptPath = path.join(getScriptsPath(), 'packages_installed.py')

  try {
    const results = await pythonExecute(
      res,
      scriptPath,
      args,
      'application/json',
    )
    res.send(results)
  } catch (error) {
    if (debug) console.error(error)
    res.status(500).json([])
  }
})

router.get('/inventory', async (req, res) => {
  if (debug) console.log('[express] Getting packages inventory...')

  const args = []
  if (req.query.version.startsWith('4.')) args.unshift('--legacy')

  const scriptPath = path.join(getScriptsPath(), 'packages_inventory.py')

  try {
    const results = await pythonExecute(
      res,
      scriptPath,
      args,
      'application/json',
    )
    res.send(results)
  } catch (error) {
    if (debug) console.error(error)
    res.status(500).json([])
  }
})

export default router
