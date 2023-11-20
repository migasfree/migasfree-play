import { ref } from 'vue'
import { defineStore } from 'pinia'
import { date } from 'quasar'

import { api } from 'boot/axios'
import { gettext } from 'boot/gettext'

import { usePackagesStore } from './packages'
import { useUiStore } from './ui'

import { internalApi, executionsMaxLength } from 'config/app.conf'

const app = window.electronRemote.app // electron-preload.js

export const useExecutionsStore = defineStore('executions', () => {
  const items = ref({})
  const lastId = ref('')
  const isRunningCommand = ref(false)
  const error = ref('')

  function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
  }

  function replaceAll(str, find, replace) {
    var exp = escapeRegExp(find)
    var re = new RegExp(exp, 'g')

    return str.replace(re, replace)
  }

  function replaceColors(txt) {
    txt = txt.replace(/\\x1b\[\?25l([\s\S]*?)\\x1b\[\?25h/g, '')

    txt = replaceAll(txt, '\r\x1b[2K\x1b[32m⠋\x1b[0m', '')
    txt = replaceAll(txt, '\r\x1b[2K\x1b[32m⠙\x1b[0m', '')
    txt = replaceAll(txt, '\r\x1b[2K\x1b[32m⠹\x1b[0m', '')
    txt = replaceAll(txt, '\r\x1b[2K\x1b[32m⠸\x1b[0m', '')
    txt = replaceAll(txt, '\r\x1b[2K\x1b[32m⠼\x1b[0m', '')
    txt = replaceAll(txt, '\r\x1b[2K\x1b[32m⠴\x1b[0m', '')
    txt = replaceAll(txt, '\r\x1b[2K\x1b[32m⠦\x1b[0m', '')
    txt = replaceAll(txt, '\r\x1b[2K\x1b[32m⠧\x1b[0m', '')
    txt = replaceAll(txt, '\r\x1b[2K\x1b[32m⠇\x1b[0m', '')
    txt = replaceAll(txt, '\r\x1b[2K\x1b[32m⠏\x1b[0m', '')

    txt = replaceAll(txt, '\x1b[32m⠋\x1b[0m', '')
    txt = replaceAll(txt, '\x1b[32m⠙\x1b[0m', '')
    txt = replaceAll(txt, '\x1b[32m⠹\x1b[0m', '')
    txt = replaceAll(txt, '\x1b[32m⠸\x1b[0m', '')
    txt = replaceAll(txt, '\x1b[32m⠼\x1b[0m', '')
    txt = replaceAll(txt, '\x1b[32m⠴\x1b[0m', '')
    txt = replaceAll(txt, '\x1b[32m⠦\x1b[0m', '')
    txt = replaceAll(txt, '\x1b[32m⠧\x1b[0m', '')
    txt = replaceAll(txt, '\x1b[32m⠇\x1b[0m', '')
    txt = replaceAll(txt, '\x1b[32m⠏\x1b[0m', '')

    txt = replaceAll(txt, '\x1b[95m', "<span class='text-purple'>") // accent
    txt = replaceAll(txt, '\x1b[35m', "<span class='text-purple'>") // accent
    txt = replaceAll(txt, '\x1b[92m', "<span class='text-green'>") // ok
    txt = replaceAll(txt, '\x1b[1;32m', "<span class='text-green'>") // ok
    txt = replaceAll(txt, '\x1b[1;92m', "<span class='text-light-green'>") // ok
    txt = replaceAll(txt, '\x1b[93m', "<span class='text-amber'>") // warning
    txt = replaceAll(txt, '\x1b[91m', "<span class='text-negative'>") // error
    txt = replaceAll(txt, '\x1b[1;91m', "<span class='text-negative'>") // error
    txt = replaceAll(txt, '\x1b[33m', "<span class='text-amber'>") // warning
    txt = replaceAll(txt, '\x1b[32m', "<span class='text-blue'>") // info
    txt = replaceAll(txt, '\x1b[1;34m', "<span class='text-blue'>") // info
    txt = replaceAll(txt, '\x1b[1;36m', "<span class='text-indigo'>") // info
    txt = replaceAll(txt, '\x1b[2;36m', "<span class='text-teal'>") // time
    txt = replaceAll(txt, '\x1b[4;94m', "<span class='text-blue'>") // info
    txt = replaceAll(txt, '\x1b[0m', '</span>')
    txt = replaceAll(txt, '\r\x1b[2K', '')
    txt = replaceAll(txt, '\x1b[2K', '')
    txt = replaceAll(txt, '\x1b[?25l', '')
    txt = replaceAll(txt, '\x1b[?25h', '')
    txt = replaceAll(txt, '\x1b[1A', '')
    txt = replaceAll(txt, '\x1b[1m', '')
    txt = txt.replace(/\t/g, '&nbsp;'.repeat(8))
    txt = txt.replace(/^ +/gm, function (match) {
      return '&nbsp;'.repeat(match.length)
    })
    txt = txt.replace(/(?:\r\n|\r|\n)/g, '<br />')

    return txt
  }

  async function getExecutions() {
    const uiStore = useUiStore()

    await api
      .get(`${internalApi}/executions`)
      .then((response) => {
        setExecutionsLog(response.data)
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
  }

  async function setExecutions() {
    const uiStore = useUiStore()

    await api.post(`${internalApi}/executions`, items.value).catch((error) => {
      uiStore.notifyError(error)
    })
  }

  function run({ cmd, text, icon }) {
    const packagesStore = usePackagesStore()
    const uiStore = useUiStore()

    if (isRunningCommand.value) {
      uiStore.notifyInfo(
        gettext.$gettext('Please wait, other process is running!!!')
      )
      return
    }
    startedCmd()

    const spawn = require('child_process').spawn
    let subprocess

    const [command, ...args] = cmd.split(' ')

    if (process.platform === 'linux') {
      subprocess = spawn(command, args, { shell: '/bin/bash' })
    } else if (process.platform === 'win32') {
      subprocess = spawn(command, args, { shell: true })
    }

    addExecution({ command: text, icon })

    subprocess.stdout.on('data', (data) => {
      appendExecutionText(replaceColors(data.toString()))
    })

    subprocess.stderr.on('data', (data) => {
      const text = replaceColors(data.toString())

      appendExecutionError(text)
      appendExecutionText(text)
    })

    // when the spawn child process exits, check if there were any errors
    subprocess.on('exit', (code) => {
      const win = window.electronRemote.getCurrentWindow() // electron-preload.js

      if (code !== 0) {
        uiStore.notifyError(`Error: ${code} ${cmd}`)
        win.show()
      } else {
        if (error.value === '') {
          packagesStore.setInstalledPackages()
        } else {
          uiStore.notifyError(
            replaceColors(error.value).replace(/(<([^>]+)>)/gi, '')
          )
          resetExecutionError()
        }
      }

      setExecutions()
      finishedCmd()

      if (cmd.includes('sync') || cmd.includes('--update')) {
        if (win.isMinimized()) win.close()

        packagesStore.setAvailablePackages()
        packagesStore.setInventory()
      }
    })
  }

  function setExecutionsLog(value) {
    items.value = value
    if (Object.keys(value).length)
      lastId.value = Object.keys(value)[Object.keys(value).length - 1]
  }

  async function startedCmd() {
    isRunningCommand.value = true
    app.canExit = false
  }

  async function finishedCmd() {
    isRunningCommand.value = false
    app.canExit = true
  }

  function addExecution({ command, icon }) {
    lastId.value = date.formatDate(
      Date.parse(new Date()),
      'YYYY-MM-DD HH:mm:ss'
    )
    items.value[lastId.value] = {
      command,
      icon,
      text: '',
    }

    while (Object.keys(items.value).length > executionsMaxLength)
      delete items.value[Reflect.ownKeys(items.value)[0]]
  }

  function appendExecutionText(text) {
    items.value[lastId.value]['text'] += text
  }

  function appendExecutionError(text) {
    error.value += text
  }

  function resetExecutionError() {
    error.value = ''
  }

  return { items, lastId, isRunningCommand, error, getExecutions, run }
})
