import Vue from 'vue'
import { date } from 'quasar'
import { executionsMaxLength } from 'config/app.conf'

const { app } = require('electron').remote

export function setExecutionsLog(state, value) {
  state.log = value
  if (Object.keys(value).length)
    state.lastId = Object.keys(value)[Object.keys(value).length - 1]
}

export function startedCmd(state) {
  state.isRunningCommand = true
  app.canExit = false
}

export function finishedCmd(state) {
  state.isRunningCommand = false
  app.canExit = true
}

export function addExecution(state, { command, icon }) {
  state.lastId = date.formatDate(Date.parse(new Date()), 'YYYY-MM-DD HH:mm:ss')
  Vue.set(state.log, state.lastId, {
    command,
    icon,
    text: ''
  })
  while (Object.keys(state.log).length > executionsMaxLength)
    delete state.log[Object.keys(state.log)[0]]
}

export function appendExecutionText(state, text) {
  state.log[state.lastId]['text'] += text
}

export function appendExecutionError(state, text) {
  state.error += text
}

export function resetExecutionError(state) {
  state.error = ''
}
