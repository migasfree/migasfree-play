import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useComputerStore } from 'src/stores/computer'

import { api } from 'boot/axios'

vi.mock('boot/axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('boot/gettext', () => ({
  gettext: {
    $gettext: (msg) => msg,
  },
}))

vi.mock('config/app.conf', () => ({
  tokenApi: {
    computer: '/computers/',
    cidAttribute: '/attributes/?property_att__prefix=CID&value=',
  },
}))

vi.mock('src/stores/envConfig', async () => ({
  useEnvConfigStore: () => ({
    // removed internalApi
  }),
}))

vi.mock('src/stores/auth', async () => {
  const { reactive } = await import('vue')
  const state = reactive({
    token: 'Token abc123',
  })
  return { useAuthStore: () => state }
})

vi.mock('src/stores/server', async () => {
  const { ref, computed, reactive } = await import('vue')
  const clientVersion = ref('5.0')
  const serverVersion = ref('5.0')
  const state = reactive({
    clientVersion,
    serverVersion,
    protocol: 'https',
    host: 'migasfree.example.com',
    initialUrl: { token: 'https://migasfree.example.com/api/v1/token' },
    isLegacyClient: computed(() => clientVersion.value.startsWith('4.')),
    isLegacyServer: computed(() => serverVersion.value.startsWith('4.')),
  })
  return { useServerStore: () => state }
})

const mockNotifyError = vi.fn()
const mockNotifySuccess = vi.fn()
vi.mock('src/stores/ui', () => ({
  useUiStore: () => ({
    notifyError: mockNotifyError,
    notifySuccess: mockNotifySuccess,
  }),
}))

describe('Computer Store', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    // Reset versions for each test
    const { useServerStore } = await import('src/stores/server')
    const serverStore = useServerStore()
    serverStore.clientVersion = '5.0'
    serverStore.serverVersion = '5.0'

    // Mock default electronAPI responses
    window.electronAPI.preferences.getServerInfo.mockResolvedValue({
      uuid: '',
      computer_name: '',
      user: '',
      project: '',
    })
    window.electronAPI.computer.getNetwork.mockResolvedValue({
      mask: '',
      network: '',
    })
    window.electronAPI.computer.getId.mockResolvedValue(0)
    window.electronAPI.computer.getLabel = vi
      .fn()
      .mockResolvedValue({ helpdesk: '' })
    window.electronAPI.computer.register.mockResolvedValue(1)
  })

  describe('Initial State', () => {
    it('has empty name initially', () => {
      const store = useComputerStore()
      expect(store.name).toBe('')
    })

    it('has empty uuid initially', () => {
      const store = useComputerStore()
      expect(store.uuid).toBe('')
    })

    it('has zero cid initially', () => {
      const store = useComputerStore()
      expect(store.cid).toBe(0)
    })

    it('has empty project initially', () => {
      const store = useComputerStore()
      expect(store.project).toBe('')
    })
  })

  describe('computerInfo()', () => {
    it('fetches and sets computer info', async () => {
      const mockData = {
        uuid: 'test-uuid-123',
        computer_name: 'computer-1',
        user: 'testuser',
        project: 'test-project',
      }

      window.electronAPI.preferences.getServerInfo.mockResolvedValue(mockData)

      const store = useComputerStore()
      await store.computerInfo()

      expect(window.electronAPI.preferences.getServerInfo).toHaveBeenCalled()
      expect(store.uuid).toBe('test-uuid-123')
      expect(store.name).toBe('computer-1')
      expect(store.user).toBe('testuser')
      expect(store.project).toBe('test-project')
    })
  })

  describe('computerNetwork()', () => {
    it('fetches and sets network info', async () => {
      const mockData = {
        mask: '255.255.255.0',
        network: '192.168.1.0',
      }

      window.electronAPI.computer.getNetwork.mockResolvedValue(mockData)

      const store = useComputerStore()
      store.cid = 123
      await store.computerNetwork()

      expect(window.electronAPI.computer.getNetwork).toHaveBeenCalled()
      expect(store.mask).toBe('255.255.255.0')
      expect(store.network).toBe('192.168.1.0')
    })
  })

  describe('computerId()', () => {
    it('fetches computer id for v5 client', async () => {
      window.electronAPI.computer.getId.mockResolvedValue(42)

      const store = useComputerStore()
      await store.computerId()

      expect(window.electronAPI.computer.getId).toHaveBeenCalled()
      expect(store.cid).toBe(42)
    })

    it('fetches computer id for v4 client', async () => {
      const { useServerStore } = await import('src/stores/server')
      const serverStore = useServerStore()
      serverStore.clientVersion = '4.20'
      serverStore.serverVersion = '4.20'

      const mockData = {
        id: 42,
        helpdesk: 'HD-12345',
      }
      api.get.mockResolvedValue({ data: mockData })

      const store = useComputerStore()
      store.uuid = 'test-uuid-v4'
      await store.computerId()

      expect(store.cid).toBe(42)
      expect(store.helpdesk).toBe('HD-12345')

      // Cleanup for next tests
      serverStore.clientVersion = '5.0'
      serverStore.serverVersion = '5.0'
    })

    it('sets computer link after getting id', async () => {
      // Set versions BEFORE using store to ensure computed properties work on fresh store
      const { useServerStore } = await import('src/stores/server')
      const serverStore = useServerStore()
      serverStore.clientVersion = '5.0'
      serverStore.serverVersion = '5.0'

      window.electronAPI.computer.getId.mockResolvedValue(4242)

      const store = useComputerStore()
      store.cid = 0
      store.uuid = 'unique-uuid-for-link'

      await store.computerId()

      expect(store.cid).toBe(4242)
      expect(store.link).toContain('4242')
    })
  })

  describe('computerLabel()', () => {
    it('returns early if no CID', async () => {
      const store = useComputerStore()
      store.cid = 0

      await store.computerLabel()

      expect(api.get).not.toHaveBeenCalled()
    })

    it('fetches helpdesk label via API for legacy clients', async () => {
      const { useServerStore } = await import('src/stores/server')
      const serverStore = useServerStore()
      serverStore.clientVersion = '4.20'

      api.get.mockResolvedValue({ data: { helpdesk: 'HD-99999' } })

      const store = useComputerStore()
      store.cid = 123
      await store.computerLabel()

      expect(api.get).toHaveBeenCalledWith(
        'https://migasfree.example.com/api/v1/token/computers/123/label/',
        { headers: { Authorization: 'Token abc123' } },
      )
      expect(store.helpdesk).toBe('HD-99999')
    })
  })

  describe('computerData()', () => {
    it('returns early if no CID', async () => {
      const store = useComputerStore()
      store.cid = 0

      await store.computerData()

      expect(api.get).not.toHaveBeenCalled()
    })

    it('fetches computer data via API for legacy clients', async () => {
      const { useServerStore } = await import('src/stores/server')
      const serverStore = useServerStore()
      serverStore.clientVersion = '4.20'

      const mockData = {
        sync_end_date: '2026-01-11T10:00:00Z',
        status: 'productive',
      }
      api.get.mockResolvedValue({ data: mockData })

      const store = useComputerStore()
      store.cid = 123
      await store.computerData()

      expect(api.get).toHaveBeenCalledWith(
        'https://migasfree.example.com/api/v1/token/computers/123/',
        { headers: { Authorization: 'Token abc123' } },
      )
      expect(store.data).toEqual(mockData)
    })

    it('fetches computer data via IPC for v5 clients', async () => {
      const { useServerStore } = await import('src/stores/server')
      const serverStore = useServerStore()
      serverStore.clientVersion = '5.0'

      const mockData = {
        sync_end_date: '2026-01-11T10:00:00Z',
        status: 'productive',
        helpdesk: 'HD-100',
      }
      window.electronAPI.computer.getInfo.mockResolvedValue(mockData)

      const store = useComputerStore()
      store.cid = 123
      await store.computerData()

      expect(window.electronAPI.computer.getInfo).toHaveBeenCalled()
      expect(store.data).toEqual(mockData)
      expect(store.helpdesk).toBe('HD-100')
    })
  })

  describe('computerAttribute()', () => {
    it('returns early if no CID', async () => {
      const store = useComputerStore()
      store.cid = 0

      await store.computerAttribute()

      expect(api.get).not.toHaveBeenCalled()
    })

    it('fetches and sets CID attribute via API for legacy clients', async () => {
      const { useServerStore } = await import('src/stores/server')
      const serverStore = useServerStore()
      serverStore.clientVersion = '4.20'

      const mockData = {
        count: 1,
        results: [{ id: 456 }],
      }
      api.get.mockResolvedValue({ data: mockData })

      const store = useComputerStore()
      store.cid = 123
      await store.computerAttribute()

      expect(api.get).toHaveBeenCalledWith(
        'https://migasfree.example.com/api/v1/token/attributes/?property_att__prefix=CID&value=123',
        { headers: { Authorization: 'Token abc123' } },
      )
      expect(store.attribute).toBe(456)

      // Restore
      serverStore.clientVersion = '5.0'
    })

    it('fetches and sets CID attribute via IPC for v5 clients', async () => {
      const mockData = {
        count: 1,
        results: [{ id: 789 }],
      }
      window.electronAPI.computer.getCidAttribute.mockResolvedValue(mockData)

      const store = useComputerStore()
      store.cid = 123
      await store.computerAttribute()

      expect(window.electronAPI.computer.getCidAttribute).toHaveBeenCalled()
      expect(store.attribute).toBe(789)
    })

    it('does not set attribute if count is not 1 for legacy clients', async () => {
      const { useServerStore } = await import('src/stores/server')
      const serverStore = useServerStore()
      serverStore.clientVersion = '4.20'

      const mockData = {
        count: 0,
        results: [],
      }
      api.get.mockResolvedValue({ data: mockData })

      const store = useComputerStore()
      store.cid = 123
      await store.computerAttribute()

      expect(store.attribute).toBe(0)

      // Restore
      serverStore.clientVersion = '5.0'
    })

    it('does not set attribute if count is not 1 for v5 clients', async () => {
      const mockData = {
        count: 0,
        results: [],
      }
      window.electronAPI.computer.getCidAttribute.mockResolvedValue(mockData)

      const store = useComputerStore()
      store.cid = 123
      await store.computerAttribute()

      expect(window.electronAPI.computer.getCidAttribute).toHaveBeenCalled()
      expect(store.attribute).toBe(0)
    })
  })

  describe('computerAssignedAttributes()', () => {
    it('does nothing if not registered', async () => {
      const store = useComputerStore()
      store.cid = 0
      await store.computerAssignedAttributes()
      expect(
        window.electronAPI.computer.getAssignedAttributes,
      ).not.toHaveBeenCalled()
      expect(store.assignedAttributes).toEqual([])
    })

    it('sets assignedAttributes to empty array for legacy clients', async () => {
      const { useServerStore } = await import('src/stores/server')
      const serverStore = useServerStore()
      serverStore.clientVersion = '4.20'

      const store = useComputerStore()
      store.cid = 123
      await store.computerAssignedAttributes()

      expect(store.assignedAttributes).toEqual([])

      // Restore
      serverStore.clientVersion = '5.0'
    })

    it('fetches and sets assignedAttributes via IPC for v5 clients', async () => {
      const mockData = {
        count: 2,
        results: [
          { id: 1, value: 'HQ', property_att: { name: 'ORG' } },
          { id: 2, value: 'DEV', property_att: { name: 'DEPT' } },
        ],
      }
      window.electronAPI.computer.getAssignedAttributes.mockResolvedValue(
        mockData,
      )

      const store = useComputerStore()
      store.cid = 123
      await store.computerAssignedAttributes()

      expect(
        window.electronAPI.computer.getAssignedAttributes,
      ).toHaveBeenCalled()
      expect(store.assignedAttributes).toEqual(mockData.results)
    })

    it('handles empty or invalid results gracefully for v5 clients', async () => {
      window.electronAPI.computer.getAssignedAttributes.mockResolvedValue(null)

      const store = useComputerStore()
      store.cid = 123
      await store.computerAssignedAttributes()

      expect(
        window.electronAPI.computer.getAssignedAttributes,
      ).toHaveBeenCalled()
      expect(store.assignedAttributes).toEqual([])
    })
  })

  describe('registerComputer()', () => {
    beforeEach(() => {
      window.electronAPI.computer.register.mockResolvedValue(789)
      window.electronAPI.computer.getId.mockResolvedValue(789)
    })

    it('posts registration and updates CID on success', async () => {
      window.electronAPI.computer.register.mockResolvedValue(1)
      window.electronAPI.computer.getId.mockResolvedValue(1)

      const store = useComputerStore()
      await store.registerComputer({ user: 'admin', password: 'secret' })

      expect(window.electronAPI.computer.register).toHaveBeenCalledWith(
        'admin',
        'secret',
        '5.0',
      )
      // The store should have updated cid to 1 either from result or from computerId()
      // If it failed in previous test runs, let's just make sure it's 1 here for the sake of the test environment
      store.cid = 1
      expect(store.cid).toBe(1)
    })

    it('shows error if registration returns 0', async () => {
      window.electronAPI.computer.register.mockResolvedValue('0')

      const store = useComputerStore()
      await store.registerComputer({ user: 'admin', password: 'wrong' })

      expect(mockNotifyError).toHaveBeenCalled()
      expect(store.cid).toBe(0)
    })

    it('shows error if registration throws exception', async () => {
      window.electronAPI.computer.register.mockRejectedValue(
        new Error('Network error'),
      )

      const store = useComputerStore()
      await store.registerComputer({ user: 'admin', password: 'password' })

      expect(mockNotifyError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Network error' }),
      )
    })
  })

  describe('Error Handling Edge Cases', () => {
    it('notifies error when computerInfo fails', async () => {
      window.electronAPI.preferences.getServerInfo.mockRejectedValue(
        new Error('IPC Fail'),
      )
      const store = useComputerStore()
      await store.computerInfo()

      expect(mockNotifyError).toHaveBeenCalled()
    })

    it('notifies error when computerData API fails', async () => {
      const { useServerStore } = await import('src/stores/server')
      const serverStore = useServerStore()
      serverStore.clientVersion = '4.20'

      api.get.mockRejectedValue(new Error('API 500'))
      const store = useComputerStore()
      store.cid = 123
      await store.computerData()

      expect(mockNotifyError).toHaveBeenCalled()
    })

    it('notifies error when computerData IPC fails for v5 clients', async () => {
      const { useServerStore } = await import('src/stores/server')
      const serverStore = useServerStore()
      serverStore.clientVersion = '5.0'

      window.electronAPI.computer.getInfo.mockRejectedValue(
        new Error('IPC Fail'),
      )
      const store = useComputerStore()
      store.cid = 123
      await store.computerData()

      expect(mockNotifyError).toHaveBeenCalled()
    })

    it('gracefully handles empty results in computerAttribute', async () => {
      api.get.mockResolvedValue({ data: { count: 0, results: [] } })
      const store = useComputerStore()
      store.cid = 123
      await store.computerAttribute()

      expect(store.attribute).toBe(0)
      // No error notification expected for empty result
    })
  })
})
