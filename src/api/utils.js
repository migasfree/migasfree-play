const os = require('os')
const { execSync } = require('child_process')

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
  } catch (error) {
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

module.exports = { getPython, debug, pythonShellOptions }
