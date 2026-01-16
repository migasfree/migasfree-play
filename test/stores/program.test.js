import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProgramStore } from 'src/stores/program'

// Mock dependencies
vi.mock('boot/axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('boot/gettext', () => ({
  gettext: {
    $gettext: (key) => key,
    interpolate: (str) => str,
  },
}))

vi.mock('src/stores/envConfig', () => ({
  useEnvConfigStore: vi.fn(() => ({
    load: vi.fn().mockResolvedValue(true),
    user: 'test-user',
    password: 'test-pass',
  })),
}))

vi.mock('src/stores/preferences', () => ({
  usePreferencesStore: vi.fn(() => ({
    readPreferences: vi.fn(),
    showApps: false,
    showDevices: false,
    showTags: false,
  })),
}))

vi.mock('src/stores/ui', () => ({
  useUiStore: () => ({
    loading: vi.fn(),
    loadingFinished: vi.fn(),
    notifyError: vi.fn(),
  }),
}))

// Mock other stores called in init
vi.mock('src/stores/apps', () => ({
  useAppsStore: () => ({ loadApps: vi.fn() }),
}))
vi.mock('src/stores/computer', () => ({
  useComputerStore: () => ({
    computerInfo: vi.fn(),
    computerId: vi.fn(),
    computerNetwork: vi.fn(),
    computerLabel: vi.fn(),
    computerData: vi.fn(),
    computerAttribute: vi.fn(),
  }),
}))
vi.mock('src/stores/devices', () => ({
  useDevicesStore: () => ({ computerDevices: vi.fn() }),
}))
vi.mock('src/stores/executions', () => ({
  useExecutionsStore: () => ({ getExecutions: vi.fn() }),
}))
vi.mock('src/stores/filters', () => ({
  useFiltersStore: () => ({ setCategories: vi.fn() }),
}))
vi.mock('src/stores/packages', () => ({
  usePackagesStore: () => ({
    setAvailablePackages: vi.fn(),
    setInstalledPackages: vi.fn(),
    setInventory: vi.fn(),
  }),
}))
vi.mock('src/stores/tags', () => ({
  useTagsStore: () => ({ getTags: vi.fn() }),
}))

import { api } from 'boot/axios'

describe('Program Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    // Setup electronAPI mocks for ServerStore calls
    window.electronAPI.preferences.getClientInfo.mockResolvedValue({
      version: '5.0.0',
    })
    window.electronAPI.preferences.getProtocol.mockResolvedValue('http')
    window.electronAPI.preferences.canManageDevices.mockResolvedValue(true)
    window.electronAPI.preferences.getServerInfo.mockResolvedValue({
      server: 'migasfree.org',
    })

    // Setup Axios mocks for External API calls (Token, Server Info)
    api.get.mockImplementation((url) => {
      // Server Info (Public API)
      if (url.includes('/info'))
        return Promise.resolve({
          data: { version: '5.0.0', organization: 'Test Org' },
        })
      // Token API
      if (url.includes('/token'))
        return Promise.resolve({ data: { token: 'valid-token' } })

      return Promise.resolve({ data: {} })
    })

    api.post.mockResolvedValue({ data: { token: 'valid-token' } })
  })

  it('init() flow runs successfully', async () => {
    const store = useProgramStore()

    await store.init()

    expect(store.clientVersion).toBe('5.0.0')
    expect(store.protocol).toBe('http')
    expect(store.host).toBe('migasfree.org')
    expect(store.token).toBe('Token valid-token')
  })

  it('init() stops app if client version is too low', async () => {
    // Override mock for this test
    window.electronAPI.preferences.getClientInfo.mockResolvedValue({
      version: '0.0.1',
    })

    const store = useProgramStore()

    await store.init()

    expect(store.appIsStopped).toBe(true)
    expect(store.status).toContain('requires at least')
  })
})
