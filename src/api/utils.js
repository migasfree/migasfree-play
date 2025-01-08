import os from 'os'
import { execSync } from 'child_process'
import { PythonShell } from 'python-shell'
function getPython() {
  const platform = os.platform()

  if (platform === 'win32') return 'python'

  const cmd = `
_PYTHON=$(which python2)
[ -n "$_PYTHON" ] && $_PYTHON -c "import migasfree_client" 2&> /dev/null || false
if [ $? -ne 0 -o -z "$_PYTHON" ]
then
  _PYTHON=$(which python3)
fi
echo $_PYTHON`
  const shell = '/bin/bash'

  try {
    return execSync(cmd, { shell }).toString().replace('\n', '')
  } catch {
    return 'python3'
  }
}

let debug = false
if (process.argv.includes('debug')) {
  debug = true
}

const pythonShellOptions = {
  pythonPath: getPython(),
  env: {
    ...process.env,
    MIGASFREE_CLIENT_DEBUG: 0,
  },
}

const pythonExecute = (res, code, contentType = 'text/plain') => {
  return new Promise((resolve) => {
    PythonShell.runString(code, pythonShellOptions)
      .then((results) => {
        res.setHeader('Content-Type', contentType)
        resolve(results[0])
      })
      .catch((error) => {
        throw error
      })
  })
}

export { debug, pythonExecute }
