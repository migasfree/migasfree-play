import os from 'os'
import path from 'path'
import { execSync } from 'child_process'
import { PythonShell } from 'python-shell'

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

const getScriptsPath = () => {
  return IS_PRODUCTION
    ? path.join(process.env.RESOURCES_PATH, 'app', 'scripts')
    : path.join(process.cwd(), 'src', 'api', 'scripts')
}
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
  try {
    const options = { ...pythonShellOptions, args }
    let results
    if (code.endsWith('.py')) {
      results = await PythonShell.run(code, options)
    } else {
      results = await PythonShell.runString(code, options)
    }

    res.setHeader('Content-Type', contentType)

    const result = results.filter((line) => line.trim()).pop()

    if (debug) console.log(result)
    return result
  } catch (error) {
    if (debug) console.error(error)
  }
}

export { debug, pythonExecute, getScriptsPath }
