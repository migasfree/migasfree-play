const os = require('os')
const fs = require('fs')
const path = require('path')
const express = require('express')

const filePath = path.join(os.homedir(), '.migasfree-play', 'executions.json')
const router = express.Router()

router.get('/', (req, res) => {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8')

    if (data) res.json(JSON.parse(data))
    else res.json({})
  } else {
    res.json({})
  }
})

router.post('/', (req, res) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2))
  res.send()
})

module.exports = router
