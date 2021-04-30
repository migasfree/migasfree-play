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
  txt = replaceAll(txt, '\u001b[92m', "<span text-color='green'>") // ok
  txt = replaceAll(txt, '\u001b[93m', "<span text-color='yellow'>") // warning
  txt = replaceAll(txt, '\u001b[91m', "<span text-color='red'>") // error
  txt = replaceAll(txt, '\u001b[32m', "<span text-color='blue'>") // info
  txt = replaceAll(txt, '\u001b[0m', '</span>')
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

export function run(context, { cmd, text, element = null }) {
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
  } else if (os.type() === 'Window_NT') {
    process = spawn('cmd', ['/C', cmd])
  }

  context.commit('executions/addExecution', text, { root: true })

  process.stdout.on('data', (data) => {
    context.commit(
      'executions/appendExecutionText',
      replaceColors(data.toString()),
      { root: true }
    )
  })

  process.stderr.on('data', (data) => {
    context.commit('executions/appendExecutionError', data.toString(), {
      root: true
    })
    context.commit(
      'executions/appendExecutionText',
      "<span text-color='negative'>" + data.toString() + '</span>',
      { root: true }
    )
  })

  // when the spawn child process exits, check if there were any errors
  process.on('exit', (code) => {
    const { remote } = require('electron')
    const win = remote.getCurrentWindow()

    if (element) element.disabled = false

    if (code !== 0) {
      console.log('exit code:', code)
      context.dispatch('ui/notifyError', `Error: ${code} ${cmd}`, {
        root: true
      })
      win.show()
    } else {
      if (context.state.error === '') {
        context.dispatch('packages/setInstalledPackages', null, {
          root: true
        })

        if (cmd.includes('sync') && win.isMinimized()) {
          win.close()
        }
      } else {
        context.dispatch('ui/notifyError', replaceColors(context.state.error), {
          root: true
        })
        context.commit('executions/resetExecutionError', null, {
          root: true
        })
      }
    }

    if (cmd.includes('sync')) {
      context.dispatch('packages/setAvailablePackages', null, {
        root: true
      })
    }

    context.dispatch('executions/setExecutions', null, { root: true })
    context.commit('executions/finishedCmd', null, { root: true })
  })
}
