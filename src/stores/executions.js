import { ref } from 'vue'
import { defineStore } from 'pinia'
import { date } from 'quasar'

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

  const trimEndSpaces = (text) => {
    let lines = text.split('\n')
    for (let i = 0; i < lines.length; i++) {
      lines[i] = lines[i].replace(/ +$/, '')
    }
    return lines.join('\n')
  }

  const escapeRegExp = (text) => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
  }

  const replaceAll = (str, find, replace) => {
    const exp = escapeRegExp(find)
    const re = new RegExp(exp, 'g')

    return str.replace(re, replace)
  }

  const replaceColors = (txt) => {
    txt = txt.replace(/\\x1b\[\?25l([\s\S]*?)\\x1b\[\?25h/g, '')

    // Patterns that should be stripped completely
    const stripPatterns = [
      '/\r\x1b[2K\x1b[32m[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]\x1b[0m/g',
      '/\x1b[32m[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]\x1b[0m/g',
      '/\x1b[?25[lh]/g',
      '/\x1b[1A/g',
      '/\x1b[1m/g',
      '/\x1b[2K/g',
      '/\r\x1b[2K/g',
    ]
    stripPatterns.forEach((p) => {
      txt = txt.replace(p, '')
    })

    // Mapping of ANSI codes -> HTML spans
    const ansiMap = [
      ['\x1b[95m', "<span class='text-purple'>"],
      ['\x1b[35m', "<span class='text-purple'>"],
      ['\x1b[92m', "<span class='text-green'>"],
      ['\x1b[1;32m', "<span class='text-green'>"],
      ['\x1b[1;92m', "<span class='text-light-green'>"],
      ['\x1b[93m', "<span class='text-amber'>"],
      ['\x1b[91m', "<span class='text-negative'>"],
      ['\x1b[1;91m', "<span class='text-negative'>"],
      ['\x1b[33m', "<span class='text-amber'>"],
      ['\x1b[32m', "<span class='text-blue'>"],
      ['\x1b[1;34m', "<span class='text-blue'>"],
      ['\x1b[1;36m', "<span class='text-indigo'>"],
      ['\x1b[2;36m', "<span class='text-teal'>"],
      ['\x1b[4;94m', "<span class='text-blue'>"],
      ['\x1b[0m', '</span>'],
    ]
    ansiMap.forEach(([code, repl]) => {
      txt = replaceAll(txt, code, repl)
    })

    txt = txt.replace(/\t/g, '&nbsp;'.repeat(8))
    txt = txt.replace(/^ +/gm, (m) => '&nbsp;'.repeat(m.length))
    txt = txt.replace(/(?:\r\n|\r|\n)/g, '<br />')

    return txt
  }

  const getExecutions = async () => {
    try {
      const data = await window.electronAPI.executions.read()
      setExecutionsLog(data)
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

  const run = ({ cmd, text, icon }) => {
    if (isRunningCommand.value) {
      uiStore.notifyInfo(
        gettext.$gettext('Please wait, other process is running!!!'),
      )
      return
    }

    try {
      startedCmd()

      // Generate unique command ID
      const commandId = Date.now().toString()
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

      addExecution({ command: text, icon })

      // Safety timeout (30 minutes max) to prevent stuck state
      const timeoutId = setTimeout(
        () => {
          if (isRunningCommand.value && currentCommandId === commandId) {
            console.error('Command timeout reached, forcing cleanup')
            appendExecutionText(
              '\n<span class="text-negative">[Command timeout - forced cleanup]</span>\n',
            )
            window.electronAPI.killCommand(commandId)
            window.electronAPI.removeCommandListeners(commandId)
            finishedCmd()
            currentCommandId = null
          }
        },
        30 * 60 * 1000,
      ) // 30 minutes

      // Set up listeners BEFORE spawning to avoid race condition
      window.electronAPI.onCommandStdout(commandId, (data) => {
        appendExecutionText(replaceColors(trimEndSpaces(data)))
      })

      window.electronAPI.onCommandStderr(commandId, (data) => {
        const text = replaceColors(trimEndSpaces(data))
        appendExecutionError(text)
        appendExecutionText(text)
      })

      window.electronAPI.onCommandExit(commandId, async (code) => {
        // Clear the safety timeout
        clearTimeout(timeoutId)

        if (code !== 0) {
          const message = `Error: ${code} ${typeof cmd === 'string' ? cmd : JSON.stringify(cmd)}`
          uiStore.notifyError(message)
          appendExecutionError(message)
          await window.electronAPI.showWindow()
        } else if (error.value === '') {
          packagesStore.setInstalledPackages()
        } else {
          uiStore.notifyError(
            error.value.replace(/<br \/>/g, '\n').replace(/(<([^>]+)>)/gi, ''),
          )
          resetExecutionError()
        }

        setExecutions()
        finishedCmd()

        const cmdStr = typeof cmd === 'string' ? cmd : JSON.stringify(cmd)
        if (cmdStr.includes('sync') || cmdStr.includes('--update')) {
          const minimized = await window.electronAPI.isMinimized()
          if (minimized) {
            await window.electronAPI.closeWindow()
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
    lastId.value = date.formatDate(
      Date.parse(new Date()),
      'YYYY-MM-DD HH:mm:ss',
    )
    items.value[lastId.value] = {
      command,
      icon,
      text: '',
      error: '',
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

  const cancelCurrentCommand = () => {
    if (currentCommandId && isRunningCommand.value) {
      window.electronAPI.killCommand(currentCommandId)
      appendExecutionText(
        '\n<span class="text-negative">[Command cancelled by user]</span>\n',
      )
      uiStore.notifyInfo(gettext.$gettext('Command cancelled'))
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
    getExecutions,
    run,
    cancelCurrentCommand,
  }
})
