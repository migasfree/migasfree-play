const os = require('os')
const fs = require('fs')
const path = require('path')
const express = require('express')
const { debug } = require('../utils')

const tokenFile = path.join(os.homedir(), '.migasfree-play', 'token')
const router = express.Router()

router.get('/', (req, res) => {
  if (debug) console.log('[express] Reading token file...')

  let token = ''

  if (fs.existsSync(tokenFile)) {
    token = fs.readFileSync(tokenFile, 'utf8')
  }
  res.json({ token })
})

router.post('/', (req, res) => {
  if (debug) {
    console.log('[express] Writing token file...')
    console.log(req.body)
  }

  fs.mkdirSync(path.dirname(tokenFile), { recursive: true })
  fs.writeFileSync(tokenFile, req.body.token)
  res.send()
})

module.exports = router
