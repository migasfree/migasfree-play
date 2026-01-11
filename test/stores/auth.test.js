import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from 'src/stores/auth'

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
  tokenAuth: { url: '/token-auth/' },
  checkTokenApi: { url: '/rest-auth/user/' },
}))

vi.mock('src/stores/envConfig', async () => ({
  useEnvConfigStore: () => ({
    internalApi: 'http://localhost:3000',
    user: 'testuser',
    password: 'testpass',
  }),
}))

vi.mock('src/stores/ui', () => ({
  useUiStore: () => ({ notifyError: vi.fn() }),
}))

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('has empty token initially', () => {
      const store = useAuthStore()
      expect(store.token).toBe('')
    })

    it('has isTokenChecked false initially', () => {
      const store = useAuthStore()
      expect(store.isTokenChecked).toBe(false)
    })

    it('has user not privileged initially', () => {
      const store = useAuthStore()
      expect(store.userIsPrivileged).toBe(false)
    })
  })

  describe('setServerInfo()', () => {
    it('stores protocol and host for token operations', async () => {
      const store = useAuthStore()
      store.setServerInfo('https', 'api.example.com')

      // Verify by checking that getToken uses these values
      api.get.mockResolvedValue({ data: {} })
      api.post.mockResolvedValue({ data: { token: 'abc' } })

      await store.getToken()

      expect(api.post).toHaveBeenCalledWith(
        'https://api.example.com/token-auth/',
        expect.any(Object),
      )
    })
  })

  describe('getToken()', () => {
    it('uses cached token if available', async () => {
      api.get.mockResolvedValue({ data: { token: 'cached-token' } })

      const store = useAuthStore()
      await store.getToken()

      expect(store.token).toBe('Token cached-token')
      expect(api.post).not.toHaveBeenCalled()
    })

    it('fetches new token from server if not cached', async () => {
      api.get.mockResolvedValue({ data: {} })
      api.post.mockResolvedValue({ data: { token: 'new-token' } })

      const store = useAuthStore()
      store.setServerInfo('https', 'api.example.com')
      await store.getToken()

      expect(store.token).toBe('Token new-token')
    })

    it('returns error on invalid credentials', async () => {
      api.get.mockResolvedValue({ data: {} })
      api.post.mockRejectedValue({ response: { status: 400 } })

      const store = useAuthStore()
      store.setServerInfo('https', 'api.example.com')
      const result = await store.getToken()

      expect(result).toEqual({ error: 'invalid_credentials' })
    })
  })

  describe('checkToken()', () => {
    it('returns success when token is valid', async () => {
      api.get.mockResolvedValue({})

      const store = useAuthStore()
      store.setServerInfo('https', 'api.example.com')
      store.setToken('valid-token')

      const result = await store.checkToken()

      expect(result).toEqual({ success: true })
      expect(store.isTokenChecked).toBe(true)
    })

    it('returns no_connection error when server unreachable', async () => {
      api.get.mockRejectedValue({ message: 'Network Error' })

      const store = useAuthStore()
      store.setServerInfo('https', 'api.example.com')

      const result = await store.checkToken()

      expect(result).toEqual({ error: 'no_connection' })
    })

    it('invalidates token on 403 response', async () => {
      api.get.mockRejectedValue({ response: { status: 403 } })
      api.post.mockResolvedValue({})

      const store = useAuthStore()
      store.setServerInfo('https', 'api.example.com')
      store.setToken('old-token')

      await store.checkToken()

      expect(store.isTokenChecked).toBe(false)
      expect(api.post).toHaveBeenCalledWith('http://localhost:3000/token', {
        token: '',
      })
    })
  })

  describe('checkUser()', () => {
    it('sets user as privileged when server confirms', async () => {
      api.post.mockResolvedValue({ data: { is_privileged: true } })

      const store = useAuthStore()
      await store.checkUser({ username: 'admin', password: 'pass' })

      expect(store.userIsPrivileged).toBe(true)
    })

    it('does not set privileged when user lacks privileges', async () => {
      api.post.mockResolvedValue({ data: { is_privileged: false } })

      const store = useAuthStore()
      await store.checkUser({ username: 'user', password: 'pass' })

      expect(store.userIsPrivileged).toBe(false)
    })
  })
})
