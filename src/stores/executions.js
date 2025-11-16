import { ref } from 'vue'
import { defineStore } from 'pinia'
import { date } from 'quasar'
import { spawn } from 'child_process'

import { api } from 'boot/axios'
import { gettext } from 'boot/gettext'

import { useComputerStore } from './computer.js'
import { usePackagesStore } from './packages.js'
import { useUiStore } from './ui.js'

import { internalApi, executionsMaxLength } from 'config/app.conf'

const app = window.electronRemote.app // electron-preload.js

export const useExecutionsStore = defineStore('executions', () => {
  const computerStore = useComputerStore()
  const packagesStore = usePackagesStore()
  const uiStore = useUiStore()

  const items = ref({})
  const lastId = ref('')
  const isRunningCommand = ref(false)
  const error = ref('')

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
    var exp = escapeRegExp(find)
    var re = new RegExp(exp, 'g')

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
      const { data } = await api.get(`${internalApi}/executions`)
      setExecutionsLog(data)
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const setExecutions = async () => {
    try {
      await api.post(`${internalApi}/executions`, items.value)
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const spawnProcess = (command, args) => {
    if (process.platform === 'linux') {
      return spawn(command, args, { shell: '/bin/bash' })
    }
    // win32 (and any other platform) falls back to default shell
    return spawn(command, args, { shell: true })
  }

  const doAfterSync = async () => {
    uiStore.notifyInfo(gettext.$gettext('Synchronization finished'))

    await computerStore.computerId() // update CID if sync has launched autoregister
    await Promise.all([
      computerStore.computerData(), // update sync data (sync_end_date, ...)
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
    startedCmd()

    const [command, ...args] = cmd.split(' ')
    const subprocess = spawnProcess(command, args)

    addExecution({ command: text, icon })

    subprocess.stdout.on('data', (data) => {
      appendExecutionText(replaceColors(trimEndSpaces(data.toString())))
    })

    subprocess.stderr.on('data', (data) => {
      const text = replaceColors(trimEndSpaces(data.toString()))

      appendExecutionError(text)
      appendExecutionText(text)
    })

    // when the spawn child process exits, check if there were any errors
    subprocess.on('exit', (code) => {
      const win = window.electronRemote.getCurrentWindow() // electron-preload.js

      if (code !== 0) {
        const message = `Error: ${code} ${cmd}`
        uiStore.notifyError(message)
        appendExecutionError(message)
        win.show()
        return
      }

      if (error.value === '') {
        packagesStore.setInstalledPackages()
      } else {
        uiStore.notifyError(
          error.value.replace(/<br \/>/g, '\n').replace(/(<([^>]+)>)/gi, ''),
        )
        resetExecutionError()
      }

      setExecutions()
      finishedCmd()

      if (cmd.includes('sync') || cmd.includes('--update')) {
        if (win.isMinimized()) win.close()

        doAfterSync()
      }
    })
  }

  const setExecutionsLog = (value) => {
    items.value = value
    if (Object.keys(value).length)
      lastId.value = Object.keys(value)[Object.keys(value).length - 1]
  }

  const startedCmd = async () => {
    isRunningCommand.value = true
    app.canExit = false
  }

  const finishedCmd = async () => {
    isRunningCommand.value = false
    app.canExit = true
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

    while (Object.keys(items.value).length > executionsMaxLength)
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

  return { items, lastId, isRunningCommand, error, getExecutions, run }
})
