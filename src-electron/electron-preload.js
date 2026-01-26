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
  log: (message, type) => ipcRenderer.send('app:log', { message, type }),

  // Window Control
  show: () => ipcRenderer.invoke('window:show'),
  isMinimized: () => ipcRenderer.invoke('window:is-minimized'),
  minimize: () => ipcRenderer.invoke('window:minimize'),
  toggleMaximize: () => ipcRenderer.invoke('window:toggle-maximize'),
  close: () => ipcRenderer.invoke('window:close'),

  // Domain APIs
  packages: {
    getAvailable: (version) =>
      ipcRenderer.invoke('packages:get-available', { version }),
    getInstalled: (packages, version) =>
      ipcRenderer.invoke('packages:get-installed', { packages, version }),
    getInventory: (version) =>
      ipcRenderer.invoke('packages:get-inventory', { version }),
  },

  preferences: {
    read: () => ipcRenderer.invoke('preferences:read'),
    write: (content) => ipcRenderer.invoke('preferences:write', content),
    getServerInfo: () => ipcRenderer.invoke('preferences:get-server-info'),
    getClientInfo: () => ipcRenderer.invoke('preferences:get-client-info'),
    getProtocol: (version) =>
      ipcRenderer.invoke('preferences:get-protocol', { version }),
    canManageDevices: () =>
      ipcRenderer.invoke('preferences:can-manage-devices'),
  },

  computer: {
    getId: () => ipcRenderer.invoke('computer:get-id'),
    getNetwork: () => ipcRenderer.invoke('computer:get-network'),
    register: (user, password, version) =>
      ipcRenderer.invoke('computer:register', { user, password, version }),
  },

  token: {
    read: () => ipcRenderer.invoke('token:read'),
    write: (data) => ipcRenderer.invoke('token:write', data),
    request: (url, username, password) =>
      ipcRenderer.invoke('token:request', { url, username, password }),
  },

  executions: {
    read: () => ipcRenderer.invoke('executions:read'),
    write: (data) => ipcRenderer.invoke('executions:write', data),
  },

  tags: {
    get: (version) => ipcRenderer.invoke('tags:get', { version }),
  },

  user: {
    check: (username, password) =>
      ipcRenderer.invoke('user:check', { username, password }),
  },

  // Command Execution
  spawnCommand: (id, command, args, input, env) => {
    ipcRenderer.send('command:spawn', { id, command, args, input, env })
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
