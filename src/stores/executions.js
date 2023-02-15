import { defineStore } from 'pinia'
import { date } from 'quasar'

import { api } from 'boot/axios'
import { gettext } from 'boot/gettext'

import { usePackagesStore } from './packages'
import { useUiStore } from './ui'

import { internalApi, executionsMaxLength } from 'config/app.conf'

const app = window.electronRemote.app // electron-preload.js

export const useExecutionsStore = defineStore('executions', {
  state: () => ({
    log: {},
    lastId: '',
    isRunningCommand: false,
    error: '',
  }),
  actions: {
    escapeRegExp(text) {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
    },

    replaceAll(str, find, replace) {
      var exp = this.escapeRegExp(find)
      var re = new RegExp(exp, 'g')

      return str.replace(re, replace)
    },

    replaceColors(txt) {
      txt = txt.replace(/\\x1b\[\?25l([\s\S]*?)\\x1b\[\?25h/g, '')

      txt = this.replaceAll(txt, '\r\x1b[2K\x1b[32m⠋\x1b[0m', '')
      txt = this.replaceAll(txt, '\r\x1b[2K\x1b[32m⠙\x1b[0m', '')
      txt = this.replaceAll(txt, '\r\x1b[2K\x1b[32m⠹\x1b[0m', '')
      txt = this.replaceAll(txt, '\r\x1b[2K\x1b[32m⠸\x1b[0m', '')
      txt = this.replaceAll(txt, '\r\x1b[2K\x1b[32m⠼\x1b[0m', '')
      txt = this.replaceAll(txt, '\r\x1b[2K\x1b[32m⠴\x1b[0m', '')
      txt = this.replaceAll(txt, '\r\x1b[2K\x1b[32m⠦\x1b[0m', '')
      txt = this.replaceAll(txt, '\r\x1b[2K\x1b[32m⠧\x1b[0m', '')
      txt = this.replaceAll(txt, '\r\x1b[2K\x1b[32m⠇\x1b[0m', '')
      txt = this.replaceAll(txt, '\r\x1b[2K\x1b[32m⠏\x1b[0m', '')

      txt = this.replaceAll(txt, '\x1b[32m⠋\x1b[0m', '')
      txt = this.replaceAll(txt, '\x1b[32m⠙\x1b[0m', '')
      txt = this.replaceAll(txt, '\x1b[32m⠹\x1b[0m', '')
      txt = this.replaceAll(txt, '\x1b[32m⠸\x1b[0m', '')
      txt = this.replaceAll(txt, '\x1b[32m⠼\x1b[0m', '')
      txt = this.replaceAll(txt, '\x1b[32m⠴\x1b[0m', '')
      txt = this.replaceAll(txt, '\x1b[32m⠦\x1b[0m', '')
      txt = this.replaceAll(txt, '\x1b[32m⠧\x1b[0m', '')
      txt = this.replaceAll(txt, '\x1b[32m⠇\x1b[0m', '')
      txt = this.replaceAll(txt, '\x1b[32m⠏\x1b[0m', '')

      txt = this.replaceAll(txt, '\x1b[95m', "<span class='text-purple'>") // accent
      txt = this.replaceAll(txt, '\x1b[35m', "<span class='text-purple'>") // accent
      txt = this.replaceAll(txt, '\x1b[92m', "<span class='text-green'>") // ok
      txt = this.replaceAll(txt, '\x1b[1;32m', "<span class='text-green'>") // ok
      txt = this.replaceAll(
        txt,
        '\x1b[1;92m',
        "<span class='text-light-green'>"
      ) // ok
      txt = this.replaceAll(txt, '\x1b[93m', "<span class='text-amber'>") // warning
      txt = this.replaceAll(txt, '\x1b[91m', "<span class='text-negative'>") // error
      txt = this.replaceAll(txt, '\x1b[1;91m', "<span class='text-negative'>") // error
      txt = this.replaceAll(txt, '\x1b[33m', "<span class='text-amber'>") // warning
      txt = this.replaceAll(txt, '\x1b[32m', "<span class='text-blue'>") // info
      txt = this.replaceAll(txt, '\x1b[1;34m', "<span class='text-blue'>") // info
      txt = this.replaceAll(txt, '\x1b[1;36m', "<span class='text-indigo'>") // info
      txt = this.replaceAll(txt, '\x1b[2;36m', "<span class='text-teal'>") // time
      txt = this.replaceAll(txt, '\x1b[4;94m', "<span class='text-blue'>") // info
      txt = this.replaceAll(txt, '\x1b[0m', '</span>')
      txt = this.replaceAll(txt, '\r\x1b[2K', '')
      txt = this.replaceAll(txt, '\x1b[2K', '')
      txt = this.replaceAll(txt, '\x1b[?25l', '')
      txt = this.replaceAll(txt, '\x1b[?25h', '')
      txt = this.replaceAll(txt, '\x1b[1A', '')
      txt = this.replaceAll(txt, '\x1b[1m', '')
      txt = txt.replace(/(?:\r\n|\r|\n)/g, '<br />')

      return txt
    },

    async getExecutions() {
      const uiStore = useUiStore()

      await api
        .get(`${internalApi}/executions`)
        .then((response) => {
          this.setExecutionsLog(response.data)
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    },

    async setExecutions() {
      const uiStore = useUiStore()

      await api.post(`${internalApi}/executions`, this.log).catch((error) => {
        uiStore.notifyError(error)
      })
    },

    run({ cmd, text, icon }) {
      const packagesStore = usePackagesStore()
      const uiStore = useUiStore()

      if (this.isRunningCommand) {
        uiStore.notifyInfo(
          gettext.$gettext('Please wait, other process is running!!!')
        )
        return
      }
      this.startedCmd()

      const spawn = require('child_process').spawn
      let subprocess

      const [command, ...args] = cmd.split(' ')

      if (process.platform === 'linux') {
        subprocess = spawn(command, args, { shell: '/bin/bash' })
      } else if (process.platform === 'win32') {
        subprocess = spawn(command, args, { shell: true })
      }

      this.addExecution({ command: text, icon })

      subprocess.stdout.on('data', (data) => {
        this.appendExecutionText(this.replaceColors(data.toString()))
      })

      subprocess.stderr.on('data', (data) => {
        const text = this.replaceColors(data.toString())

        this.appendExecutionError(text)
        this.appendExecutionText(text)
      })

      // when the spawn child process exits, check if there were any errors
      subprocess.on('exit', (code) => {
        const win = window.electronRemote.getCurrentWindow() // electron-preload.js

        if (code !== 0) {
          uiStore.notifyError(`Error: ${code} ${cmd}`)
          win.show()
        } else {
          if (this.error === '') {
            packagesStore.setInstalledPackages()
          } else {
            uiStore.notifyError(
              this.replaceColors(this.error).replace(/(<([^>]+)>)/gi, '')
            )
            this.resetExecutionError()
          }
        }

        this.setExecutions()
        this.finishedCmd()

        if (cmd.includes('sync')) {
          if (win.isMinimized()) win.close()

          packagesStore.setAvailablePackages()
        }
      })
    },

    setExecutionsLog(value) {
      this.log = value
      if (Object.keys(value).length)
        this.lastId = Object.keys(value)[Object.keys(value).length - 1]
    },

    async startedCmd() {
      this.isRunningCommand = true
      app.canExit = false
    },

    async finishedCmd() {
      this.isRunningCommand = false
      app.canExit = true
    },

    addExecution({ command, icon }) {
      this.lastId = date.formatDate(
        Date.parse(new Date()),
        'YYYY-MM-DD HH:mm:ss'
      )
      this.log[this.lastId] = {
        command,
        icon,
        text: '',
      }
      while (Object.keys(this.log).length > executionsMaxLength)
        delete this.log[Object.keys(this.log)[0]]
    },

    appendExecutionText(text) {
      this.log[this.lastId]['text'] += text
    },

    appendExecutionError(text) {
      this.error += text
    },

    resetExecutionError() {
      this.error = ''
    },
  },
})
