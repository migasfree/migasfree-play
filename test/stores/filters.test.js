import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFiltersStore } from 'src/stores/filters'

import { api } from 'boot/axios'

vi.mock('boot/axios', () => ({
  api: { get: vi.fn() },
}))

vi.mock('config/app.conf', () => ({
  tokenApi: { categories: '/catalog/categories/' },
  tokenApiv4: { categories: '/catalog/apps/categories/' },
}))

vi.mock('src/stores/auth', async () => {
  const { ref } = await import('vue')
  const state = {
    token: ref('valid-token'),
  }
  return { useAuthStore: () => state }
})

vi.mock('src/stores/server', async () => {
  const { ref } = await import('vue')
  const state = {
    initialUrl: ref({ token: 'http://api' }),
    serverVersion: ref('5.0'),
  }
  return { useServerStore: () => state }
})

vi.mock('src/stores/ui', () => ({
  useUiStore: () => ({ notifyError: vi.fn() }),
}))

describe('Filters Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    window.electronAPI = {
      apps: {
        getCategories: vi.fn(),
      },
    }
  })

  describe('Initial State', () => {
    it('has empty categories initially', () => {
      const store = useFiltersStore()
      expect(store.categories).toEqual([])
    })

    it('has null selectedCategory initially', () => {
      const store = useFiltersStore()
      expect(store.selectedCategory).toBeNull()
    })

    it('has null searchApp initially', () => {
      const store = useFiltersStore()
      expect(store.searchApp).toBeNull()
    })

    it('has false onlyInstalledApps initially', () => {
      const store = useFiltersStore()
      expect(store.onlyInstalledApps).toBe(false)
    })

    it('has null searchDevice initially', () => {
      const store = useFiltersStore()
      expect(store.searchDevice).toBeNull()
    })

    it('has false onlyAssignedDevices initially', () => {
      const store = useFiltersStore()
      expect(store.onlyAssignedDevices).toBe(false)
    })
  })

  describe('setCategories()', () => {
    it('fetches and processes categories for v5 API', async () => {
      window.electronAPI.apps.getCategories.mockResolvedValue([
        { id: 1, name: 'Internet' },
        { id: 2, name: 'Multimedia' },
      ])

      const store = useFiltersStore()
      await store.setCategories()

      expect(window.electronAPI.apps.getCategories).toHaveBeenCalled()
      expect(store.categories).toEqual([
        { id: 1, name: 'Internet' },
        { id: 2, name: 'Multimedia' },
      ])
    })

    it('fetches and processes categories for v4 API', async () => {
      const { useServerStore } = await import('src/stores/server')
      const serverStore = useServerStore()
      serverStore.serverVersion.value = '4.20'

      const mockCategories = {
        1: 'Internet',
        2: 'Multimedia',
      }

      api.get.mockResolvedValue({ data: mockCategories })

      const store = useFiltersStore()
      await store.setCategories()

      expect(api.get).toHaveBeenCalledWith(
        'http://api/catalog/apps/categories/',
        { headers: { Authorization: 'valid-token' } },
      )
      expect(store.categories).toEqual([
        { id: 1, name: 'Internet' },
        { id: 2, name: 'Multimedia' },
      ])
    })

    it('handles API errors', async () => {
      const mockError = new Error('Network error')
      api.get.mockRejectedValue(mockError)

      const store = useFiltersStore()
      await store.setCategories()

      expect(store.categories).toEqual([])
    })
  })
})
