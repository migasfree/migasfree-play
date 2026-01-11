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
    internalApi: 'http://test-api',
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

    // Setup API mocks
    api.get.mockImplementation((url) => {
      if (url.includes('/preferences/client'))
        return Promise.resolve({ data: { version: '5.0.0' } })
      if (url.includes('/preferences/protocol'))
        return Promise.resolve({ data: 'http' })
      if (url.includes('/preferences/manage-devices'))
        return Promise.resolve({ data: true })
      if (url.includes('/preferences/server'))
        return Promise.resolve({ data: { server: 'migasfree.org' } })
      if (url.includes('/info'))
        return Promise.resolve({
          data: { version: '5.0.0', organization: 'Test Org' },
        })
      if (url.includes('/token'))
        return Promise.resolve({ data: { token: 'valid-token' } })
      return Promise.resolve({ data: {} })
    })
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
    api.get.mockImplementation((url) => {
      if (url.includes('/preferences/client'))
        return Promise.resolve({ data: { version: '0.0.1' } }) // Too low
      return Promise.resolve({ data: {} })
    })

    const store = useProgramStore()

    await store.init()

    expect(store.appIsStopped).toBe(true)
    expect(store.status).toContain('requires at least')
  })
})
