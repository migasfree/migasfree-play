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

      // Set up listeners BEFORE spawning to avoid race condition
      window.electronAPI.onCommandStdout(commandId, (data) => {
        appendExecutionText(data)
      })

      window.electronAPI.onCommandStderr(commandId, (data) => {
        appendExecutionError(data)
        appendExecutionText(data)
      })

      window.electronAPI.onCommandExit(commandId, async (code) => {
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
