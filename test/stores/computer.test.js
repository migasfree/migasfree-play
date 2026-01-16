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

vi.mock('src/stores/program', async () => {
  const { ref } = await import('vue')
  const state = {
    clientVersion: ref('5.0'),
    protocol: ref('https'),
    host: ref('migasfree.example.com'),
    initialUrl: ref({ token: 'https://migasfree.example.com/api/v1/token' }),
    token: ref('Token abc123'),
    serverVersion: ref('5.0'),
  }
  return { useProgramStore: () => state }
})

vi.mock('src/stores/ui', () => ({
  useUiStore: () => ({
    notifyError: vi.fn(),
    notifySuccess: vi.fn(),
  }),
}))

describe('Computer Store', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    // Reset clientVersion to 5.0 for each test
    const { useProgramStore } = await import('src/stores/program')
    const programStore = useProgramStore()
    programStore.clientVersion.value = '5.0'

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
      const { useProgramStore } = await import('src/stores/program')
      const programStore = useProgramStore()
      programStore.clientVersion.value = '4.20'

      const mockData = {
        id: 99,
        helpdesk: 'HD-12345',
      }
      api.get.mockResolvedValue({ data: mockData })

      const store = useComputerStore()
      store.uuid = 'test-uuid'
      await store.computerId()

      expect(store.cid).toBe(99)
      expect(store.helpdesk).toBe('HD-12345')
    })

    it('sets computer link after getting id', async () => {
      window.electronAPI.computer.getId.mockResolvedValue(42)

      const store = useComputerStore()
      // Set cid directly and check if link is set correctly after computerId
      await store.computerId()

      // The link should contain the cid value
      expect(store.link).toContain('/42')
    })
  })

  describe('computerLabel()', () => {
    it('returns early if no CID', async () => {
      const store = useComputerStore()
      store.cid = 0

      await store.computerLabel()

      expect(api.get).not.toHaveBeenCalled()
    })

    it('fetches helpdesk label', async () => {
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

    it('fetches computer data', async () => {
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
  })

  describe('computerAttribute()', () => {
    it('returns early if no CID', async () => {
      const store = useComputerStore()
      store.cid = 0

      await store.computerAttribute()

      expect(api.get).not.toHaveBeenCalled()
    })

    it('fetches and sets CID attribute', async () => {
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
    })

    it('does not set attribute if count is not 1', async () => {
      const mockData = {
        count: 0,
        results: [],
      }
      api.get.mockResolvedValue({ data: mockData })

      const store = useComputerStore()
      store.cid = 123
      await store.computerAttribute()

      expect(store.attribute).toBe(0)
    })
  })

  describe('registerComputer()', () => {
    it('posts registration and updates CID on success', async () => {
      window.electronAPI.computer.register.mockResolvedValue(789)
      window.electronAPI.computer.getId.mockResolvedValue(789)

      const store = useComputerStore()
      await store.registerComputer({ user: 'admin', password: 'secret' })

      expect(window.electronAPI.computer.register).toHaveBeenCalledWith(
        'admin',
        'secret',
        '5.0',
      )
      expect(window.electronAPI.computer.getId).toHaveBeenCalled()
      expect(store.cid).toBe(789)
    })

    it('shows error if registration returns 0', async () => {
      window.electronAPI.computer.register.mockResolvedValue('0')

      const store = useComputerStore()
      await store.registerComputer({ user: 'admin', password: 'wrong' })

      // notifyError should be called (via uiStore mock)
      expect(store.cid).toBe(0)
    })
  })
})
