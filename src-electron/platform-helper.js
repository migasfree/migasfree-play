import os from 'os'

export const platform = process.platform || os.platform()

export const isWindows = platform === 'win32'
export const isLinux = platform === 'linux'
export const isDarwin = platform === 'darwin'

export function getShell() {
  return isLinux ? '/bin/bash' : true
}

export function getPythonCommand() {
  return isWindows ? 'python' : 'python3'
}
