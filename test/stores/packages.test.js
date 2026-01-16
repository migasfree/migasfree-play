import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePackagesStore } from 'src/stores/packages'

// Mock environment and dependencies
vi.mock('src/stores/program', async () => {
  const { ref } = await import('vue')
  const state = {
    clientVersion: ref('5.0'),
  }
  return { useProgramStore: () => state }
})

vi.mock('src/stores/apps', async () => {
  const { ref } = await import('vue')
  const packagesRef = ref(['firefox', 'vlc'])
  return {
    useAppsStore: () => ({
      getAppsPackages: packagesRef,
    }),
  }
})

vi.mock('src/stores/ui', () => ({
  useUiStore: () => ({ notifyError: vi.fn() }),
}))

describe('Packages Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    // Mock window.electronAPI
    vi.stubGlobal('electronAPI', {
      packages: {
        getAvailable: vi.fn(),
        getInstalled: vi.fn(),
        getInventory: vi.fn(),
      },
    })
  })

  describe('Initial State', () => {
    it('has empty available packages initially', () => {
      const store = usePackagesStore()
      expect(store.available).toEqual([])
    })

    it('has empty installed packages initially', () => {
      const store = usePackagesStore()
      expect(store.installed).toEqual([])
    })

    it('has empty inventory initially', () => {
      const store = usePackagesStore()
      expect(store.inventory).toEqual([])
    })
  })

  describe('setAvailablePackages()', () => {
    it('fetches and stores available packages', async () => {
      const mockPackages = ['package1', 'package2', 'package3']
      window.electronAPI.packages.getAvailable.mockResolvedValue(mockPackages)

      const store = usePackagesStore()
      await store.setAvailablePackages()

      expect(window.electronAPI.packages.getAvailable).toHaveBeenCalledWith(
        '5.0',
      )
      expect(store.available).toEqual(mockPackages)
    })

    it('handles errors', async () => {
      window.electronAPI.packages.getAvailable.mockRejectedValue(
        new Error('IPC error'),
      )

      const store = usePackagesStore()
      await store.setAvailablePackages()

      expect(store.available).toBeUndefined()
    })
  })

  describe('setInstalledPackages()', () => {
    it('posts apps packages and stores installed list', async () => {
      const mockInstalled = ['firefox', 'vlc']
      window.electronAPI.packages.getInstalled.mockResolvedValue(mockInstalled)

      const store = usePackagesStore()
      await store.setInstalledPackages()

      expect(window.electronAPI.packages.getInstalled).toHaveBeenCalledWith(
        ['firefox', 'vlc'],
        '5.0',
      )
      expect(store.installed).toEqual(mockInstalled)
    })

    it('handles errors', async () => {
      window.electronAPI.packages.getInstalled.mockRejectedValue(
        new Error('IPC error'),
      )

      const store = usePackagesStore()
      await store.setInstalledPackages()

      expect(store.installed).toBeUndefined()
    })
  })

  describe('setInventory()', () => {
    it('fetches and stores inventory', async () => {
      const mockInventory = [
        { name: 'package1', version: '1.0' },
        { name: 'package2', version: '2.0' },
      ]
      window.electronAPI.packages.getInventory.mockResolvedValue(mockInventory)

      const store = usePackagesStore()
      await store.setInventory()

      expect(window.electronAPI.packages.getInventory).toHaveBeenCalledWith(
        '5.0',
      )
      expect(store.inventory).toEqual(mockInventory)
    })
  })
})
