import { internalApi } from 'config/app.conf'

function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

function replaceAll(str, find, replace) {
  var exp = escapeRegExp(find)
  var re = new RegExp(exp, 'g')

  return str.replace(re, replace)
}

function replaceColors(txt) {
  txt = replaceAll(txt, '\x1b[92m', "<span class='text-green'>") // ok
  txt = replaceAll(txt, '\x1b[93m', "<span class='text-yellow'>") // warning
  txt = replaceAll(txt, '\x1b[91m', "<span class='text-negative'>") // error
  txt = replaceAll(txt, '\x1b[32m', "<span class='text-blue'>") // info
  txt = replaceAll(txt, '\x1b[0m', '</span>')
  txt = txt.replace(/(?:\r\n|\r|\n)/g, '<br />')

  return txt
}

export async function getExecutions(context) {
  await this.$axios
    .get(`${internalApi}/executions`)
    .then((response) => {
      context.commit('setExecutionsLog', response.data)
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}

export async function setExecutions(context) {
  await this.$axios
    .post(`${internalApi}/executions`, context.state.log)
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}

export function run(context, { cmd, text, icon }) {
  if (context.state.isRunningCommand) {
    context.dispatch(
      'ui/notifyInfo',
      this.$gettext('Please wait, other process is running!!!'),
      { root: true }
    )
    return
  }
  context.commit('executions/startedCmd', null, { root: true })

  const os = require('os')
  const spawn = require('child_process').spawn
  let process

  if (os.type() === 'Linux') {
    process = spawn('bash', ['-c', cmd])
  } else if (os.type() === 'Windows_NT') {
    process = spawn('cmd', ['/C', cmd])
  }

  context.commit(
    'executions/addExecution',
    { command: text, icon },
    { root: true }
  )

  process.stdout.on('data', (data) => {
    context.commit(
      'executions/appendExecutionText',
      replaceColors(data.toString()),
      { root: true }
    )
  })

  process.stderr.on('data', (data) => {
    context.commit('executions/appendExecutionError', data.toString(), {
      root: true,
    })
    context.commit(
      'executions/appendExecutionText',
      "<span class='text-negative'>" + data.toString() + '</span>',
      { root: true }
    )
  })

  // when the spawn child process exits, check if there were any errors
  process.on('exit', (code) => {
    const win = window.electronRemote.getCurrentWindow() // electron-preload.js

    if (code !== 0) {
      context.dispatch('ui/notifyError', `Error: ${code} ${cmd}`, {
        root: true,
      })
      win.show()
    } else {
      if (context.state.error === '') {
        context.dispatch('packages/setInstalledPackages', null, {
          root: true,
        })
      } else {
        context.dispatch('ui/notifyError', replaceColors(context.state.error), {
          root: true,
        })
        context.commit('executions/resetExecutionError', null, {
          root: true,
        })
      }
    }

    context.dispatch('executions/setExecutions', null, { root: true })
    context.commit('executions/finishedCmd', null, { root: true })

    if (cmd.includes('sync')) {
      if (win.isMinimized()) win.close()

      context.dispatch('packages/setAvailablePackages', null, {
        root: true,
      })
    }
  })
}
