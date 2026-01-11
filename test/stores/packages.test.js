import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePackagesStore } from 'src/stores/packages'

import { api } from 'boot/axios'

vi.mock('boot/axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('src/stores/envConfig', async () => {
  const { ref } = await import('vue')
  return {
    useEnvConfigStore: () => ({
      internalApi: ref('http://localhost:3000').value,
    }),
  }
})

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
      api.get.mockResolvedValue({ data: mockPackages })

      const store = usePackagesStore()
      await store.setAvailablePackages()

      expect(api.get).toHaveBeenCalledWith(
        'http://localhost:3000/packages/available/?version=5.0',
      )
      expect(store.available).toEqual(mockPackages)
    })

    it('handles API errors', async () => {
      api.get.mockRejectedValue(new Error('Network error'))

      const store = usePackagesStore()
      await store.setAvailablePackages()

      expect(store.available).toBeUndefined()
    })
  })

  describe('setInstalledPackages()', () => {
    it('posts apps packages and stores installed list', async () => {
      const mockInstalled = ['firefox', 'vlc']
      api.post.mockResolvedValue({ data: mockInstalled })

      const store = usePackagesStore()
      await store.setInstalledPackages()

      expect(api.post).toHaveBeenCalledWith(
        'http://localhost:3000/packages/installed/?version=5.0',
        ['firefox', 'vlc'],
      )
      expect(store.installed).toEqual(mockInstalled)
    })

    it('handles API errors', async () => {
      api.post.mockRejectedValue(new Error('Network error'))

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
      api.get.mockResolvedValue({ data: mockInventory })

      const store = usePackagesStore()
      await store.setInventory()

      expect(api.get).toHaveBeenCalledWith(
        'http://localhost:3000/packages/inventory/?version=5.0',
      )
      expect(store.inventory).toEqual(mockInventory)
    })
  })
})
