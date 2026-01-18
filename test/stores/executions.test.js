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
      undefined,
      undefined,
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

  describe('Executions persistence', () => {
    it('getExecutions() reads data from electronAPI', async () => {
      const mockData = {
        '2026-01-18 12:00:00': {
          command: 'Test command',
          icon: 'mdi-test',
          text: 'output',
          error: '',
        },
      }
      window.electronAPI.executions.read.mockResolvedValue(mockData)

      const store = useExecutionsStore()
      await store.getExecutions()

      expect(window.electronAPI.executions.read).toHaveBeenCalled()
      expect(store.items).toEqual(mockData)
    })

    it('setExecutions() serializes data correctly for IPC (regression test)', async () => {
      // This test verifies that Vue reactive proxies are serialized
      // to plain objects before being sent via IPC.
      // Bug: "An object could not be cloned" when passing Vue proxy to IPC
      window.electronAPI.executions.write.mockResolvedValue(true)

      const store = useExecutionsStore()

      // Simulate adding an execution (creates reactive data)
      const commandId = '987654321'
      vi.spyOn(Date, 'now').mockReturnValue(Number(commandId))

      let exitCallback = null
      window.electronAPI.onCommandExit.mockImplementation((id, cb) => {
        exitCallback = cb
        return () => {}
      })

      store.run({ cmd: 'test', text: 'Test', icon: 'icon' })

      // Complete the command to trigger setExecutions
      await exitCallback(0)

      // Verify write was called with a plain object (not a Vue proxy)
      expect(window.electronAPI.executions.write).toHaveBeenCalled()
      const writtenData = window.electronAPI.executions.write.mock.calls[0][0]

      // The data should be a plain object that can be JSON serialized
      expect(() => JSON.stringify(writtenData)).not.toThrow()
      expect(typeof writtenData).toBe('object')
    })

    it('getExecutions() handles errors gracefully', async () => {
      window.electronAPI.executions.read.mockRejectedValue(
        new Error('Read failed'),
      )

      const store = useExecutionsStore()
      // Should not throw
      await expect(store.getExecutions()).resolves.not.toThrow()
    })

    it('setExecutions() handles write errors gracefully', async () => {
      window.electronAPI.executions.write.mockRejectedValue(
        new Error('Write failed'),
      )

      const store = useExecutionsStore()
      const commandId = '111222333'
      vi.spyOn(Date, 'now').mockReturnValue(Number(commandId))

      let exitCallback = null
      window.electronAPI.onCommandExit.mockImplementation((id, cb) => {
        exitCallback = cb
        return () => {}
      })

      store.run({ cmd: 'test', text: 'Test', icon: 'icon' })

      // Complete the command - should not throw even if write fails
      await expect(exitCallback(0)).resolves.not.toThrow()
    })
  })

  describe('Command formats', () => {
    it('runs command with object format (command, args, input, env)', async () => {
      const store = useExecutionsStore()
      const commandId = '555666777'
      vi.spyOn(Date, 'now').mockReturnValue(Number(commandId))

      window.electronAPI.spawnCommand.mockImplementation(() => {})

      let exitCallback = null
      window.electronAPI.onCommandExit.mockImplementation((id, cb) => {
        exitCallback = cb
        return () => {}
      })

      const cmd = {
        command: 'migasfree',
        args: ['sync'],
        input: 'some-input',
        env: { MY_VAR: 'value' },
      }

      store.run({ cmd, text: 'Sync', icon: 'mdi-sync' })

      expect(window.electronAPI.spawnCommand).toHaveBeenCalledWith(
        commandId,
        'migasfree',
        ['sync'],
        'some-input',
        { MY_VAR: 'value' },
      )

      await exitCallback(0)
    })

    it('triggers doAfterSync for sync commands', async () => {
      const store = useExecutionsStore()
      const commandId = '888999000'
      vi.spyOn(Date, 'now').mockReturnValue(Number(commandId))

      let exitCallback = null
      window.electronAPI.onCommandExit.mockImplementation((id, cb) => {
        exitCallback = cb
        return () => {}
      })

      // Run a sync command
      store.run({
        cmd: { command: 'migasfree', args: ['sync'] },
        text: 'Synchronization',
        icon: 'mdi-sync',
      })

      window.electronAPI.isMinimized.mockResolvedValue(false)

      // Complete the command - doAfterSync should be called
      await exitCallback(0)

      // After sync, isMinimized was checked (part of doAfterSync flow)
      expect(window.electronAPI.isMinimized).toHaveBeenCalled()
    })

    it('prevents running multiple commands simultaneously', () => {
      const store = useExecutionsStore()

      // Mock to capture callbacks but not complete
      window.electronAPI.onCommandExit.mockImplementation(() => () => {})

      // Start first command
      store.run({ cmd: 'first', text: 'First', icon: '' })
      expect(store.isRunningCommand).toBe(true)

      // Try to start second command
      store.run({ cmd: 'second', text: 'Second', icon: '' })

      // Should still only have one command in progress
      // spawnCommand called only once (for first command)
      expect(window.electronAPI.spawnCommand).toHaveBeenCalledTimes(1)
    })
  })

  describe('Error handling in stderr', () => {
    it('captures stderr output as error', async () => {
      const store = useExecutionsStore()
      const commandId = '123123123'
      vi.spyOn(Date, 'now').mockReturnValue(Number(commandId))

      let stderrCallback = null
      let exitCallback = null

      window.electronAPI.onCommandStderr.mockImplementation((id, cb) => {
        stderrCallback = cb
        return () => {}
      })
      window.electronAPI.onCommandExit.mockImplementation((id, cb) => {
        exitCallback = cb
        return () => {}
      })

      store.run({ cmd: 'failing-cmd', text: 'Failing', icon: '' })

      // Simulate stderr output
      stderrCallback('Error: Something went wrong')

      // Check that error was captured
      expect(store.error).toContain('Error: Something went wrong')

      await exitCallback(0)
    })
  })
})
