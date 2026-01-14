import os from 'os'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { PythonShell } from 'python-shell'

const getPython = () => {
  const platform = os.platform()

  if (platform === 'win32') return 'python'

  const cmd = `
_PYTHON=$(which python2 2>/dev/null)
if [ -n "$_PYTHON" ] && $_PYTHON -c "import migasfree_client" &>/dev/null
then
  echo $_PYTHON
else
  _PYTHON=$(which python3 2>/dev/null || echo "python3")
  echo $_PYTHON
fi`

  try {
    return execSync(cmd, { shell: '/bin/bash' }).toString().trim()
  } catch {
    return 'python3'
  }
}

const debug = process.argv.includes('debug')

const pythonShellOptions = {
  pythonPath: getPython(),
  env: {
    ...process.env,
    MIGASFREE_CLIENT_DEBUG: 0,
  },
  mode: 'text',
  encoding: 'utf8',
}

const pythonExecute = async (
  res,
  code,
  args = [],
  contentType = 'text/plain',
) => {
  const uniqueId = `${Date.now()}-${process.pid}-${Math.random().toString(36).slice(2, 11)}`
  const tmpFile = path.join(os.tmpdir(), `script-${uniqueId}.py`)
  fs.writeFileSync(tmpFile, code, 'utf8')

  if (debug) {
    console.log(tmpFile)
    console.log(code)
    console.log(args)
  }

  try {
    const options = { ...pythonShellOptions, args }
    const results = await PythonShell.run(tmpFile, options)

    res.setHeader('Content-Type', contentType)

    if (debug) console.log(results[0])
    return results[0]
  } catch (error) {
    if (debug) console.error(error)
  } finally {
    if (!debug) fs.unlinkSync(tmpFile)
  }
}

export { debug, pythonExecute }
