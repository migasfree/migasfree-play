import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEnvConfigStore } from 'src/stores/envConfig'

describe('EnvConfig Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    // Reset the mock implementation for each test
    window.electronAPI.getEnvConfig.mockResolvedValue({
      executionsLimit: 10,
      user: 'test-user',
      password: 'test-password',
    })
  })

  it('should have default values initially', () => {
    const store = useEnvConfigStore()
    expect(store.executionsLimit).toBe(5)
    expect(store.user).toBe('migasfree-play')
    expect(store.password).toBe('migasfree-play')
    expect(store.isLoaded).toBe(false)
  })

  it('load() should update state from electronAPI', async () => {
    const store = useEnvConfigStore()

    await store.load()

    expect(window.electronAPI.getEnvConfig).toHaveBeenCalledTimes(1)
    expect(store.executionsLimit).toBe(10)
    expect(store.user).toBe('test-user')
    expect(store.password).toBe('test-password')
    expect(store.isLoaded).toBe(true)
  })

  it('load() should not call API if already loaded', async () => {
    const store = useEnvConfigStore()
    store.isLoaded = true

    await store.load()

    expect(window.electronAPI.getEnvConfig).not.toHaveBeenCalled()
  })

  it('load() should handle errors gracefully', async () => {
    const store = useEnvConfigStore()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    window.electronAPI.getEnvConfig.mockRejectedValue(new Error('IPC Error'))

    await store.load()

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to load env config:',
      expect.any(Error),
    )
    expect(store.isLoaded).toBe(false) // Should remain false on error? Actually implementation stays false if it throws before setting true

    consoleSpy.mockRestore()
  })
})
