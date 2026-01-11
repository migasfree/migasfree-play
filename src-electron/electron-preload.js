/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 */

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // App State
  getSyncAfterStart: () => ipcRenderer.invoke('app:get-sync-after-start'),
  getPlatform: () => ipcRenderer.invoke('app:get-platform'),
  getEnvConfig: () => ipcRenderer.invoke('app:get-env-config'),
  setCanExit: (value) => ipcRenderer.send('app:set-can-exit', value),

  // Window Control
  showWindow: () => ipcRenderer.invoke('window:show'),
  isMinimized: () => ipcRenderer.invoke('window:is-minimized'),
  closeWindow: () => ipcRenderer.invoke('window:close'),

  // Command Execution
  spawnCommand: (id, command, args) => {
    ipcRenderer.send('command:spawn', { id, command, args })
  },
  killCommand: (id) => ipcRenderer.send('command:kill', { id }),

  onCommandStdout: (id, callback) => {
    const listener = (_, data) => callback(data)
    ipcRenderer.on(`command:stdout:${id}`, listener)
    return () => ipcRenderer.removeListener(`command:stdout:${id}`, listener)
  },

  onCommandStderr: (id, callback) => {
    const listener = (_, data) => callback(data)
    ipcRenderer.on(`command:stderr:${id}`, listener)
    return () => ipcRenderer.removeListener(`command:stderr:${id}`, listener)
  },

  onCommandExit: (id, callback) => {
    const listener = (_, code) => callback(code)
    ipcRenderer.on(`command:exit:${id}`, listener)
    return () => ipcRenderer.removeListener(`command:exit:${id}`, listener)
  },

  removeCommandListeners: (id) => {
    ipcRenderer.removeAllListeners(`command:stdout:${id}`)
    ipcRenderer.removeAllListeners(`command:stderr:${id}`)
    ipcRenderer.removeAllListeners(`command:exit:${id}`)
  },
})
