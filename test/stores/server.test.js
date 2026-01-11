import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useServerStore } from 'src/stores/server'

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
    interpolate: (msg, params) => msg.replace('%{version}', params.version),
  },
}))

vi.mock('config/app.conf', () => ({
  publicApi: {
    prefix: '/api/v1/public',
    serverInfo: '/server/info/',
  },
  tokenApi: {
    prefix: '/api/v1/token',
  },
  minimumClientVersion: '5.0',
}))

vi.mock('src/stores/envConfig', async () => ({
  useEnvConfigStore: () => ({
    internalApi: 'http://localhost:3000',
  }),
}))

vi.mock('src/stores/ui', () => ({
  useUiStore: () => ({ notifyError: vi.fn() }),
}))

describe('Server Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('has empty protocol initially', () => {
      const store = useServerStore()
      expect(store.protocol).toBe('')
    })

    it('has empty host initially', () => {
      const store = useServerStore()
      expect(store.host).toBe('')
    })

    it('has default clientVersion 0', () => {
      const store = useServerStore()
      expect(store.clientVersion).toBe('0')
    })
  })

  describe('clientInfo()', () => {
    it('fetches and sets client version', async () => {
      api.get.mockResolvedValue({ data: { version: '5.10' } })

      const store = useServerStore()
      await store.clientInfo()

      expect(api.get).toHaveBeenCalledWith(
        'http://localhost:3000/preferences/client',
      )
      expect(store.clientVersion).toBe('5.10')
    })
  })

  describe('checkClientVersion()', () => {
    it('returns success when version is sufficient', () => {
      const store = useServerStore()
      store.clientVersion = '5.10'

      const result = store.checkClientVersion()

      expect(result).toEqual({ success: true })
    })

    it('returns error when version is too old', () => {
      const store = useServerStore()
      store.clientVersion = '4.0'

      const result = store.checkClientVersion()

      expect(result.error).toBe('version_too_old')
      expect(result.message).toContain('5.0')
    })
  })

  describe('serverInfo()', () => {
    it('fetches server version and organization', async () => {
      const store = useServerStore()
      store.setInitialUrl() // Will use empty values, but we mock the API

      api.get.mockResolvedValue({
        data: { version: '5.5', organization: 'TestOrg' },
      })

      // Set up initialUrl for the test
      store.protocol = 'https'
      store.host = 'api.example.com'
      store.setInitialUrl()

      await store.serverInfo()

      expect(store.serverVersion).toBe('5.5')
      expect(store.organization).toBe('TestOrg')
    })
  })

  describe('apiProtocol()', () => {
    it('fetches and sets protocol', async () => {
      api.get.mockResolvedValue({ data: 'https' })

      const store = useServerStore()
      store.clientVersion = '5.0'
      await store.apiProtocol()

      expect(api.get).toHaveBeenCalledWith(
        'http://localhost:3000/preferences/protocol/?version=5.0',
      )
      expect(store.protocol).toBe('https')
    })
  })

  describe('serverHost()', () => {
    it('fetches and sets server host', async () => {
      api.get.mockResolvedValue({ data: { server: 'migasfree.example.com' } })

      const store = useServerStore()
      await store.serverHost()

      expect(store.host).toBe('migasfree.example.com')
    })
  })

  describe('setInitialUrl()', () => {
    it('builds URLs from protocol and host', () => {
      const store = useServerStore()
      store.protocol = 'https'
      store.host = 'api.example.com'

      store.setInitialUrl()

      expect(store.initialUrl.baseDomain).toBe('https://api.example.com')
      expect(store.initialUrl.public).toBe(
        'https://api.example.com/api/v1/public',
      )
      expect(store.initialUrl.token).toBe(
        'https://api.example.com/api/v1/token',
      )
    })
  })

  describe('clientManageDevices()', () => {
    it('fetches and sets manageDevices', async () => {
      api.get.mockResolvedValue({ data: false })

      const store = useServerStore()
      await store.clientManageDevices()

      expect(store.manageDevices).toBe(false)
    })
  })
})
