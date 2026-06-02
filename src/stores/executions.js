import { ref } from 'vue'
import { defineStore } from 'pinia'

import { gettext } from 'boot/gettext'

import { useComputerStore } from './computer.js'
import { useEnvConfigStore } from './envConfig.js'

import { usePackagesStore } from './packages.js'
import { useUiStore } from './ui.js'

export const useExecutionsStore = defineStore('executions', () => {
  const computerStore = useComputerStore()
  const envConfigStore = useEnvConfigStore()
  const packagesStore = usePackagesStore()
  const uiStore = useUiStore()

  const items = ref({})
  const lastId = ref('')
  const isRunningCommand = ref(false)
  const error = ref('')
  let currentCommandId = null

  const stripAnsi = (text) =>
    text.replace(
      // eslint-disable-next-line no-control-regex
      /\x1b\[[0-9;]*[a-zA-Z]|\x1b\[\?[0-9;]*[a-zA-Z]/g,
      '',
    )

  const colorizeJson = (obj) => {
    const jsonStr = JSON.stringify(obj, null, 2)
    let result = ''
    let inString = false
    let currentWord = ''

    const flushWord = () => {
      if (!currentWord) return ''
      let style = '\x1b[37m' // white
      if (/^(true|false)$/.test(currentWord)) {
        style = '\x1b[1;33m' // bold yellow
      } else if (currentWord === 'null') {
        style = '\x1b[90m' // grey
      } else if (/^-?\d+(?:\.\d*)?$/.test(currentWord)) {
        style = '\x1b[35m' // magenta
      }
      const temp = style + currentWord + '\x1b[0m'
      currentWord = ''
      return temp
    }

    for (let i = 0; i < jsonStr.length; i++) {
      const char = jsonStr[i]
      if (char === '"') {
        if (inString) {
          inString = false
          let lookAhead = i + 1
          while (lookAhead < jsonStr.length && /\s/.test(jsonStr[lookAhead])) {
            lookAhead++
          }
          if (jsonStr[lookAhead] === ':') {
            result += '\x1b[1;36m"' + currentWord + '"\x1b[0m'
          } else {
            result += '\x1b[32m"' + currentWord + '"\x1b[0m'
          }
          currentWord = ''
        } else {
          result += flushWord()
          inString = true
        }
      } else if (inString) {
        currentWord += char
      } else if (/[{}[\],:]/.test(char)) {
        result += flushWord()
        result += '\x1b[90m' + char + '\x1b[0m'
      } else if (/\s/.test(char)) {
        result += flushWord()
        result += char
      } else {
        currentWord += char
      }
    }
    result += flushWord()
    return result
  }

  const getExecutions = async () => {
    try {
      const data = await window.electronAPI.executions.read()
      setExecutionsLog(data)

      const activeTasks = await window.electronAPI.getActiveTasks()
      if (activeTasks && activeTasks.length > 0) {
        const activeTask = activeTasks[0]
        console.log(
          '[executions store] Found active task in Main Process, re-attaching:',
          activeTask,
        )

        // If the task was not yet added to local executions items.value, add it
        if (!items.value[activeTask.id]) {
          items.value[activeTask.id] = {
            command: activeTask.command + ' ' + activeTask.args.join(' '),
            icon: 'mdi-console',
            text: '',
            error: '',
          }
          lastId.value = activeTask.id
        } else {
          // Clear text/error before re-attaching, as we'll get the full buffer re-streamed
          items.value[activeTask.id].text = ''
          items.value[activeTask.id].error = ''
        }

        // Call run with existingTaskId to re-attach listeners and fetch logs
        run(
          {
            cmd: { command: activeTask.command, args: activeTask.args },
            text: activeTask.command + ' ' + activeTask.args.join(' '),
            icon: 'mdi-console',
          },
          activeTask.id,
        )
      }
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const setExecutions = async () => {
    try {
      // Convert Vue reactive proxy to plain object for IPC serialization
      const plainData = JSON.parse(JSON.stringify(items.value))
      await window.electronAPI.executions.write(plainData)
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const doAfterSync = async () => {
    uiStore.notifyInfo(gettext.$gettext('Synchronization finished'))

    await computerStore.computerId()
    await Promise.all([
      computerStore.computerData(),
      packagesStore.setAvailablePackages(),
      packagesStore.setInventory(),
    ])
  }

  const run = ({ cmd, text, icon }, existingTaskId = null) => {
    if (isRunningCommand.value && !existingTaskId) {
      uiStore.notifyInfo(
        gettext.$gettext('Please wait, other process is running!!!'),
      )
      return
    }

    try {
      startedCmd()

      // Generate unique command ID
      const commandId = existingTaskId || Date.now().toString()
      currentCommandId = commandId

      let command, args, input, env

      if (typeof cmd === 'string') {
        const parts = cmd.split(' ')
        command = parts[0]
        args = parts.slice(1)
      } else {
        command = cmd.command
        args = cmd.args || []
        input = cmd.input
        env = cmd.env
      }

      if (!existingTaskId) {
        addExecution({ command: text, icon })
      }

      let stdoutBuffer = ''

      // Set up listeners BEFORE spawning to avoid race condition
      window.electronAPI.onCommandStdout(commandId, (data) => {
        stdoutBuffer += data
        const lines = stdoutBuffer.split('\n')
        stdoutBuffer = lines.pop()

        for (const rawLine of lines) {
          const line = rawLine.replace(/\r$/, '')
          if (!line.trim()) continue
          try {
            if (line.startsWith('{') && line.endsWith('}')) {
              const obj = JSON.parse(line)
              if (obj && typeof obj === 'object') {
                if (obj.type === 'log') {
                  let msg = obj.message
                  const lowerMsg = msg.toLowerCase()
                  if (
                    lowerMsg.includes('error') ||
                    lowerMsg.includes('failed') ||
                    lowerMsg.includes('falló') ||
                    lowerMsg.includes('error:')
                  ) {
                    msg = `\x1b[1;31m${msg}\x1b[0m`
                  } else if (
                    lowerMsg.includes('warn') ||
                    lowerMsg.includes('advertencia')
                  ) {
                    msg = `\x1b[33m${msg}\x1b[0m`
                  }
                  appendExecutionText(msg + '\n')
                } else if (obj.type === 'progress') {
                  if (obj.percent !== undefined) {
                    items.value[lastId.value].percent = obj.percent
                  }
                  if (obj.stage) {
                    items.value[lastId.value].stage = obj.stage
                  }
                  if (obj.message) {
                    const lineDivider = `\n\x1b[90m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\x1b[0m\n`
                    appendExecutionText(
                      `${lineDivider}\x1b[1;34m➔\x1b[0m \x1b[1m${obj.message}\x1b[0m\n\n`,
                    )
                  }
                } else if (obj.type === 'traits') {
                  const title = `\x1b[1;36m➔ [Traits] Características de hardware/sistema detectadas:\x1b[0m\n`
                  const formatted = colorizeJson(obj.data)
                  appendExecutionText(`${title}${formatted}\n`)
                } else if (obj.type === 'status') {
                  if (obj.stage === 'ok') {
                    appendExecutionText(
                      `\x1b[1;32m✓ [OK] ${obj.message}\x1b[0m\n`,
                    )
                  } else if (obj.stage === 'failed') {
                    appendExecutionText(
                      `\x1b[1;31m✗ [ERROR] ${obj.message}\x1b[0m\n`,
                    )
                  } else {
                    appendExecutionText(`${obj.message}\n`)
                  }
                } else {
                  appendExecutionText(
                    (obj.message || JSON.stringify(obj)) + '\n',
                  )
                }
                continue
              }
            }
          } catch {
            // fallback to raw text
          }
          appendExecutionText(line + '\n')
        }
      })

      window.electronAPI.onCommandStderr(commandId, (data) => {
        appendExecutionError(data)
        appendExecutionText(data)
      })

      window.electronAPI.onCommandExit(commandId, async (code) => {
        if (stdoutBuffer) {
          const line = stdoutBuffer.replace(/\r$/, '')
          stdoutBuffer = ''
          try {
            if (line.startsWith('{') && line.endsWith('}')) {
              const obj = JSON.parse(line)
              if (obj && typeof obj === 'object') {
                if (obj.type === 'log') {
                  let msg = obj.message
                  const lowerMsg = msg.toLowerCase()
                  if (
                    lowerMsg.includes('error') ||
                    lowerMsg.includes('failed') ||
                    lowerMsg.includes('falló') ||
                    lowerMsg.includes('error:')
                  ) {
                    msg = `\x1b[1;31m${msg}\x1b[0m`
                  } else if (
                    lowerMsg.includes('warn') ||
                    lowerMsg.includes('advertencia')
                  ) {
                    msg = `\x1b[33m${msg}\x1b[0m`
                  }
                  appendExecutionText(msg + '\n')
                } else if (obj.type === 'progress') {
                  if (obj.percent !== undefined) {
                    items.value[lastId.value].percent = obj.percent
                  }
                  if (obj.stage) {
                    items.value[lastId.value].stage = obj.stage
                  }
                  if (obj.message) {
                    const lineDivider = `\n\x1b[90m⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\x1b[0m\n`
                    appendExecutionText(
                      `${lineDivider}\x1b[1;34m➔\x1b[0m \x1b[1m${obj.message}\x1b[0m\n\n`,
                    )
                  }
                } else if (obj.type === 'traits') {
                  const title = `\x1b[1;36m➔ [Traits] Características de hardware/sistema detectadas:\x1b[0m\n`
                  const formatted = colorizeJson(obj.data)
                  appendExecutionText(`${title}${formatted}\n`)
                } else if (obj.type === 'status') {
                  if (obj.stage === 'ok') {
                    appendExecutionText(
                      `\x1b[1;32m✓ [OK] ${obj.message}\x1b[0m\n`,
                    )
                  } else if (obj.stage === 'failed') {
                    appendExecutionText(
                      `\x1b[1;31m✗ [ERROR] ${obj.message}\x1b[0m\n`,
                    )
                  } else {
                    appendExecutionText(`${obj.message}\n`)
                  }
                } else {
                  appendExecutionText(
                    (obj.message || JSON.stringify(obj)) + '\n',
                  )
                }
              }
            } else {
              appendExecutionText(line + '\n')
            }
          } catch {
            appendExecutionText(line + '\n')
          }
        }

        // Capture minimized state BEFORE any potential window.show() calls
        const minimized = await window.electronAPI.isMinimized()

        if (code !== 0) {
          const message = `Error: ${code} ${typeof cmd === 'string' ? cmd : JSON.stringify(cmd)}`
          uiStore.notifyError(message)
          appendExecutionError(message)
          await window.electronAPI.show()
        } else if (error.value === '') {
          packagesStore.setInstalledPackages()
        } else {
          uiStore.notifyError(stripAnsi(error.value))
          resetExecutionError()
        }

        await setExecutions()
        finishedCmd()

        const cmdStr = typeof cmd === 'string' ? cmd : JSON.stringify(cmd)
        if (cmdStr.includes('sync') || cmdStr.includes('--update')) {
          if (minimized) {
            await window.electronAPI.close()
          }

          doAfterSync()
        }

        // Clean up listeners
        window.electronAPI.removeCommandListeners(commandId)
        currentCommandId = null
      })

      // Spawn command via IPC (after listeners are set up)
      window.electronAPI.spawnCommand(commandId, command, args, input, env)
    } catch (err) {
      // Ensure cleanup on any error during setup
      console.error('Error starting command:', err)
      uiStore.notifyError(err)
      finishedCmd()
      currentCommandId = null
    }
  }

  const setExecutionsLog = (value) => {
    items.value = value
    if (Object.keys(value).length)
      lastId.value = Object.keys(value)[Object.keys(value).length - 1]
  }

  const startedCmd = () => {
    isRunningCommand.value = true
    window.electronAPI.setCanExit(false)
  }

  const finishedCmd = () => {
    isRunningCommand.value = false
    window.electronAPI.setCanExit(true)
  }

  const addExecution = ({ command, icon }) => {
    lastId.value = new Date().toISOString()
    items.value[lastId.value] = {
      command,
      icon,
      text: '',
      error: '',
      percent: 0,
      stage: '',
    }

    while (Object.keys(items.value).length > envConfigStore.executionsLimit)
      delete items.value[Reflect.ownKeys(items.value)[0]]
  }

  const appendExecutionText = (text) => {
    items.value[lastId.value]['text'] += text
  }

  const appendExecutionError = (text) => {
    error.value += text
    items.value[lastId.value]['error'] += text
  }

  const resetExecutionError = () => {
    error.value = ''
  }

  const cancelCurrentCommand = async () => {
    if (currentCommandId && isRunningCommand.value) {
      if (items.value[lastId.value]) {
        const currentStage = (
          items.value[lastId.value].stage || ''
        ).toLowerCase()
        if (
          [
            'update',
            'install',
            'uninstall',
            'actualizar',
            'instalar',
            'desinstalar',
          ].includes(currentStage)
        ) {
          console.warn(
            '[executions store] Cancel blocked: cannot stop tasks during package operations',
          )
          return
        }
      }
      window.electronAPI.killCommand(currentCommandId)
      if (items.value[lastId.value]) {
        items.value[lastId.value].cancelled = true
      }
      appendExecutionText('\n[Command cancelled by user]\n')
      uiStore.notifyInfo(gettext.$gettext('Command cancelled'))
      await setExecutions()
      finishedCmd()
      window.electronAPI.removeCommandListeners(currentCommandId)
      currentCommandId = null
    }
  }

  return {
    items,
    lastId,
    isRunningCommand,
    error,
    stripAnsi,
    getExecutions,
    run,
    cancelCurrentCommand,
  }
})
