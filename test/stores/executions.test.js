import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useExecutionsStore } from 'src/stores/executions'
import { useEnvConfigStore } from 'src/stores/envConfig'

vi.mock('quasar', () => ({
  date: {
    formatDate: () => `mock-date-${Date.now()}`,
  },
  useQuasar: () => ({
    dark: { isActive: false },
    notify: vi.fn(),
  }),
}))

vi.mock('boot/axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('boot/gettext', () => ({
  gettext: {
    $gettext: (key) => key,
  },
}))

vi.mock('src/stores/computer', () => ({
  useComputerStore: () => ({
    computerId: vi.fn(),
    computerData: vi.fn(),
  }),
}))

vi.mock('src/stores/packages', () => ({
  usePackagesStore: () => ({
    setAvailablePackages: vi.fn(),
    setInventory: vi.fn(),
    setInstalledPackages: vi.fn(),
  }),
}))

vi.mock('src/stores/ui', () => ({
  useUiStore: () => ({
    notifyError: vi.fn(),
    notifyInfo: vi.fn(),
  }),
}))

describe('Executions Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    // Setup default env config
    const envStore = useEnvConfigStore()
    envStore.executionsLimit = 2
    envStore.internalApi = 'http://test-api'
  })

  it('runs a command successfully', async () => {
    const store = useExecutionsStore()
    const commandId = '123456789'
    vi.spyOn(Date, 'now').mockReturnValue(Number(commandId))

    // Mock IPC spawn
    window.electronAPI.spawnCommand.mockImplementation(() => {})

    // Mock listener setup to capture callbacks
    let removeListenersCalled = false
    let exitCallback = null
    let stdoutCallback = null

    window.electronAPI.onCommandExit.mockImplementation((id, cb) => {
      if (id === commandId) exitCallback = cb
      return () => {}
    })
    window.electronAPI.onCommandStdout.mockImplementation((id, cb) => {
      if (id === commandId) stdoutCallback = cb
      return () => {}
    })

    window.electronAPI.removeCommandListeners.mockImplementation((id) => {
      if (id === commandId) removeListenersCalled = true
    })

    // Execute run
    store.run({ cmd: 'ls -la', text: 'List files', icon: 'list' })

    expect(store.isRunningCommand).toBe(true)
    expect(window.electronAPI.spawnCommand).toHaveBeenCalledWith(
      commandId,
      'ls',
      ['-la'],
    )
    expect(store.items[store.lastId].command).toBe('List files')

    // Simulate stdout
    stdoutCallback('file.txt\n')
    expect(store.items[store.lastId].text).toContain('file.txt')

    // Simulate exit (success)
    await exitCallback(0)

    expect(store.isRunningCommand).toBe(false)
    expect(removeListenersCalled).toBe(true)
    expect(window.electronAPI.setCanExit).toHaveBeenCalledWith(true)
  })

  it('handles command failure', async () => {
    const store = useExecutionsStore()
    const commandId = 'error-cmd'
    vi.spyOn(Date, 'now').mockReturnValue(Number(commandId))

    let exitCallback = null
    window.electronAPI.onCommandExit.mockImplementation((id, cb) => {
      exitCallback = cb
      return () => {}
    })

    store.run({ cmd: 'fail', text: 'Fail command', icon: 'error' })

    // Simulate exit with error code
    await exitCallback(1)

    expect(window.electronAPI.showWindow).toHaveBeenCalled()
    expect(store.items[store.lastId].error).toContain('Error: 1 fail')
  })

  it('cancels running command', () => {
    const store = useExecutionsStore()
    const commandId = '12345' // numeric string
    vi.spyOn(Date, 'now').mockReturnValue(Number(commandId))

    store.run({ cmd: 'long-process', text: 'Long process', icon: 'timer' })

    expect(store.isRunningCommand).toBe(true)

    store.cancelCurrentCommand()

    expect(window.electronAPI.killCommand).toHaveBeenCalledWith(commandId)
    expect(store.items[store.lastId].text).toContain(
      '[Command cancelled by user]',
    )
    expect(store.isRunningCommand).toBe(false)
  })

  it('limits number of executions in history', async () => {
    const store = useExecutionsStore()
    const envStore = useEnvConfigStore()
    envStore.executionsLimit = 2

    // Helper to run a command to completion
    const runCommand = async (id) => {
      vi.spyOn(Date, 'now').mockReturnValue(Number(id))

      let exitCallback = null
      window.electronAPI.onCommandExit.mockImplementation((_, cb) => {
        exitCallback = cb
        return () => {}
      })

      store.run({ cmd: `cmd-${id}`, text: `Command ${id}`, icon: '' })
      await exitCallback(0)
    }

    await runCommand('100')
    await runCommand('200')
    await runCommand('300')

    // Should only have 2 items (limit is 2)
    const keys = Object.keys(store.items)
    expect(keys.length).toBe(2)

    expect(keys).not.toContain('mock-date-100')
    expect(keys).toContain('mock-date-200')
    expect(keys).toContain('mock-date-300')
  })
})
