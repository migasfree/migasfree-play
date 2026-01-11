import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTagsStore } from 'src/stores/tags'

import { api } from 'boot/axios'

vi.mock('boot/axios', () => ({
  api: { get: vi.fn() },
}))

vi.mock('src/stores/computer', async () => {
  const { ref } = await import('vue')
  const state = {
    cid: ref(123),
  }
  return { useComputerStore: () => state }
})

vi.mock('src/stores/envConfig', async () => ({
  useEnvConfigStore: () => ({
    internalApi: 'http://localhost:3000',
  }),
}))

vi.mock('src/stores/program', async () => {
  const { ref } = await import('vue')
  const state = {
    clientVersion: ref('5.0'),
  }
  return { useProgramStore: () => state }
})

vi.mock('src/stores/ui', () => ({
  useUiStore: () => ({ notifyError: vi.fn() }),
}))

describe('Tags Store', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    // Reset cid to 123 for each test
    const { useComputerStore } = await import('src/stores/computer')
    const computerStore = useComputerStore()
    computerStore.cid.value = 123
  })

  describe('Initial State', () => {
    it('has empty available tags initially', () => {
      const store = useTagsStore()
      expect(store.available).toEqual([])
    })

    it('has empty assigned tags initially', () => {
      const store = useTagsStore()
      expect(store.assigned).toEqual([])
    })
  })

  describe('getTags()', () => {
    it('returns early if no CID', async () => {
      const { useComputerStore } = await import('src/stores/computer')
      const computerStore = useComputerStore()
      computerStore.cid.value = 0

      const store = useTagsStore()
      await store.getTags()

      expect(api.get).not.toHaveBeenCalled()
    })

    it('fetches and sets available/assigned tags', async () => {
      const mockTags = {
        available: [
          { id: 1, name: 'tag1' },
          { id: 2, name: 'tag2' },
        ],
        assigned: [{ id: 1, name: 'tag1' }],
      }

      api.get.mockResolvedValue({ data: mockTags })

      const store = useTagsStore()
      await store.getTags()

      expect(api.get).toHaveBeenCalledWith(
        'http://localhost:3000/tags/?version=5.0',
      )
      expect(store.available).toEqual(mockTags.available)
      expect(store.assigned).toEqual(mockTags.assigned)
    })

    it('handles API errors', async () => {
      api.get.mockRejectedValue(new Error('Network error'))

      const store = useTagsStore()
      await store.getTags()

      expect(store.available).toEqual([])
      expect(store.assigned).toEqual([])
    })
  })

  describe('setAssignedTags()', () => {
    it('updates assigned tags', () => {
      const store = useTagsStore()
      const newTags = [
        { id: 1, name: 'tag1' },
        { id: 3, name: 'tag3' },
      ]

      store.setAssignedTags(newTags)

      expect(store.assigned).toEqual(newTags)
    })
  })
})
