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

vi.mock('src/stores/program', async () => {
  const { ref } = await import('vue')
  const state = {
    initialUrl: ref({ token: 'http://api' }),
    token: ref('valid-token'),
    serverVersion: ref('5.0'),
  }
  return { useProgramStore: () => state }
})

vi.mock('src/stores/ui', () => ({
  useUiStore: () => ({ notifyError: vi.fn() }),
}))

describe('Filters Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
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
      const mockCategories = {
        results: [
          { id: 1, name: 'Internet' },
          { id: 2, name: 'Multimedia' },
        ],
      }

      api.get.mockResolvedValue({ data: mockCategories })

      const store = useFiltersStore()
      await store.setCategories()

      expect(api.get).toHaveBeenCalledWith('http://api/catalog/categories/', {
        headers: { Authorization: 'valid-token' },
      })
      expect(store.categories).toEqual([
        { id: 1, name: 'Internet' },
        { id: 2, name: 'Multimedia' },
      ])
    })

    it('fetches and processes categories for v4 API', async () => {
      const { useProgramStore } = await import('src/stores/program')
      const programStore = useProgramStore()
      programStore.serverVersion.value = '4.20'

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
