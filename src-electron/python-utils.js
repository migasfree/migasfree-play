/* eslint no-undef: "off" */
import os from 'os'
import path from 'path'
import { execSync, execFile, exec } from 'child_process'
import { promisify } from 'util'
import { PythonShell } from 'python-shell'

const execFileAsync = promisify(execFile)
const execAsync = promisify(exec)

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

const getScriptsPath = () => {
  return IS_PRODUCTION
    ? path.join(process.resourcesPath, 'app', 'scripts')
    : path.join(process.cwd(), 'src-electron', 'resources', 'scripts')
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

const debug = process.argv.includes('debug') || process.env.DEBUGGING

const pythonShellOptions = {
  pythonPath: getPython(),
  env: {
    ...process.env,
    MIGASFREE_CLIENT_DEBUG: 'False',
  },
  mode: 'text',
  encoding: 'utf8',
}

const getMigasfreeBinary = () => {
  if (os.platform() !== 'win32') return 'migasfree'
  try {
    execSync('where migasfree.cmd', { stdio: 'ignore' })
    return 'migasfree.cmd'
  } catch {
    return 'migasfree.exe'
  }
}

const MIGASFREE_BINARY = getMigasfreeBinary()

const cliExecute = async (args = []) => {
  const binary = MIGASFREE_BINARY

  if (debug) {
    console.log(`[python-utils] Executing CLI: ${binary} ${args.join(' ')}`)
  }

  try {
    let stdout
    if (binary.endsWith('.cmd')) {
      const cmdStr = `${binary} ${args.join(' ')}`
      const result = await execAsync(cmdStr, {
        maxBuffer: 1024 * 1024 * 50,
        env: pythonShellOptions.env,
      })
      stdout = result.stdout
    } else {
      const result = await execFileAsync(binary, args, {
        maxBuffer: 1024 * 1024 * 50,
        env: pythonShellOptions.env,
      })
      stdout = result.stdout
    }
    return stdout.trim()
  } catch (error) {
    if (debug) {
      console.error(`[python-utils] CLI Execution failed:`, error)
    }
    throw error
  }
}

const pythonExecute = async (code, args = []) => {
  try {
    const options = { ...pythonShellOptions, args }
    let results
    if (code.endsWith('.py')) {
      results = await PythonShell.run(code, options)
    } else {
      results = await PythonShell.runString(code, options)
    }

    const filtered = results.map((line) => line.trim()).filter((line) => line)
    if (filtered.length === 0) return ''

    // Try to reconstruct JSON if it was split across lines
    let combined = ''
    for (let i = 0; i < filtered.length; i++) {
      combined += filtered[i]
      if (combined.startsWith('{') && combined.endsWith('}')) {
        try {
          JSON.parse(combined)
          if (debug)
            console.log('[python-utils] JSON reconstructed successfully')
          return combined
        } catch {
          // Continue joining lines
        }
      }
    }

    // Fallback to the last non-empty line for simple strings (http, True, etc)
    const result = filtered.pop()
    if (debug) console.log('[python-utils] Result:', result)
    return result
  } catch (error) {
    if (debug) console.error(error)
    throw error // Re-throw to be handled by the caller
  }
}

let clientVersionPromise = null
let confInfoPromise = null

const getClientVersion = () => {
  if (!clientVersionPromise) {
    clientVersionPromise = (async () => {
      try {
        const results = await cliExecute(['--quiet', 'version'])
        const lines = results.trim().split('\n')
        return lines[lines.length - 1].trim()
      } catch (error) {
        try {
          const results = await cliExecute(['--version'])
          const lines = results.trim().split('\n')
          return lines[lines.length - 1].trim()
        } catch {
          try {
            const code =
              'import migasfree_client; print(migasfree_client.__version__)'
            const results = await pythonExecute(code)
            return results.trim()
          } catch {
            return '4.0' // safe fallback
          }
        }
      }
    })()
  }
  return clientVersionPromise
}

const getConfInfo = () => {
  if (!confInfoPromise) {
    confInfoPromise = (async () => {
      const results = await cliExecute(['--quiet', 'conf', '--json'])
      const lines = results.trim().split('\n')
      const jsonLine = lines[lines.length - 1].trim()
      return JSON.parse(jsonLine)
    })()
  }
  return confInfoPromise
}

const clearConfCache = () => {
  confInfoPromise = null
}

export {
  debug,
  pythonExecute,
  cliExecute,
  getClientVersion,
  getConfInfo,
  clearConfCache,
  getScriptsPath,
}
