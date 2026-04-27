import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTagsStore } from 'src/stores/tags'

vi.mock('src/stores/computer', async () => {
  const { ref, computed } = await import('vue')
  const cid = ref(123)
  const project = ref('migasfree')
  const isRegisteredComp = computed(
    () => !!cid.value && cid.value !== '0' && cid.value !== 0,
  )
  const store = {
    cid,
    project,
    get isRegistered() {
      return isRegisteredComp.value
    },
    computerId: vi.fn(),
    computerData: vi.fn(),
    computerNetwork: vi.fn(),
    computerLabel: vi.fn(),
    computerAttribute: vi.fn(),
    registerComputer: vi.fn(),
  }
  return {
    useComputerStore: () => store,
  }
})

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

    // Default mock response
    window.electronAPI.tags.get.mockResolvedValue({
      available: [],
      assigned: [],
    })
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

      expect(window.electronAPI.tags.get).not.toHaveBeenCalled()
    })

    it('fetches and sets available/assigned tags', async () => {
      const mockTags = {
        available: [
          { id: 1, name: 'tag1' },
          { id: 2, name: 'tag2' },
        ],
        assigned: [{ id: 1, name: 'tag1' }],
      }

      window.electronAPI.tags.get.mockResolvedValue(mockTags)

      const store = useTagsStore()
      await store.getTags()

      expect(window.electronAPI.tags.get).toHaveBeenCalledWith('5.0')
      expect(store.available).toEqual(mockTags.available)
      expect(store.assigned).toEqual(mockTags.assigned)
    })

    it('handles API errors', async () => {
      window.electronAPI.tags.get.mockRejectedValue(new Error('Network error'))

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
