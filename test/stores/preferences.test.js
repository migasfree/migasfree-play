import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePreferencesStore } from 'src/stores/preferences'

import { api } from 'boot/axios'

vi.mock('boot/axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('quasar', () => ({
  Dark: {
    set: vi.fn(),
  },
  LocalStorage: {
    set: vi.fn(),
    getItem: vi.fn(),
  },
}))

vi.mock('boot/gettext', () => ({
  gettext: {
    $gettext: (msg) => msg,
    current: 'es_ES',
  },
}))

vi.mock('src/stores/envConfig', async () => ({
  useEnvConfigStore: () => ({
    internalApi: 'http://localhost:3000',
  }),
}))

vi.mock('src/stores/ui', () => ({
  useUiStore: () => ({ notifyError: vi.fn() }),
}))

const mockPreferencesData = {
  language: 'en_US',
  show_language: true,
  show_computer_link: true,
  show_sync_details: false,
  show_apps: true,
  show_devices: true,
  show_tags: true,
  show_details: true,
  show_preferences: true,
  show_info: true,
  show_help: true,
  dark_mode: true,
  show_dark_mode: true,
}

describe('Preferences Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('has default language es_ES', () => {
      const store = usePreferencesStore()
      expect(store.language).toBe('es_ES')
    })

    it('has default showApps true', () => {
      const store = usePreferencesStore()
      expect(store.showApps).toBe(true)
    })

    it('has default darkMode false', () => {
      const store = usePreferencesStore()
      expect(store.darkMode).toBe(false)
    })
  })

  describe('readPreferences()', () => {
    it('fetches and sets all preference values', async () => {
      api.get.mockResolvedValue({ data: mockPreferencesData })

      const store = usePreferencesStore()
      await store.readPreferences()

      expect(api.get).toHaveBeenCalledWith('http://localhost:3000/preferences')
      expect(store.language).toBe('en_US')
      expect(store.showLanguage).toBe(true)
      expect(store.showComputerLink).toBe(true)
      expect(store.showSyncDetails).toBe(false)
      expect(store.showApps).toBe(true)
      expect(store.showDevices).toBe(true)
      expect(store.showTags).toBe(true)
      expect(store.darkMode).toBe(true)
    })

    it('sets dark mode via Quasar', async () => {
      const { Dark, LocalStorage } = await import('quasar')
      api.get.mockResolvedValue({ data: mockPreferencesData })

      const store = usePreferencesStore()
      await store.readPreferences()

      expect(Dark.set).toHaveBeenCalledWith(true)
      expect(LocalStorage.set).toHaveBeenCalledWith('darkMode', true)
    })

    it('handles API errors', async () => {
      api.get.mockRejectedValue(new Error('Network error'))

      const store = usePreferencesStore()
      await store.readPreferences()

      // Should keep default values
      expect(store.language).toBe('es_ES')
    })
  })

  describe('savePreferences()', () => {
    it('posts all preferences', async () => {
      api.post.mockResolvedValue({})

      const store = usePreferencesStore()
      store.language = 'ca_ES'
      store.darkMode = true
      await store.savePreferences()

      expect(api.post).toHaveBeenCalledWith(
        'http://localhost:3000/preferences',
        expect.objectContaining({
          language: 'ca_ES',
          dark_mode: true,
          show_apps: true,
        }),
      )
    })

    it('sets dark mode after saving', async () => {
      const { Dark, LocalStorage } = await import('quasar')
      api.post.mockResolvedValue({})

      const store = usePreferencesStore()
      store.darkMode = true
      await store.savePreferences()

      expect(Dark.set).toHaveBeenCalledWith(true)
      expect(LocalStorage.set).toHaveBeenCalledWith('darkMode', true)
    })
  })

  describe('setLanguage()', () => {
    it('updates language value', () => {
      const store = usePreferencesStore()

      store.setLanguage('fr_FR')

      expect(store.language).toBe('fr_FR')
    })

    it('updates gettext current language', async () => {
      const { gettext } = await import('boot/gettext')
      const store = usePreferencesStore()

      store.setLanguage('ca_ES')

      expect(gettext.current).toBe('ca_ES')
    })
  })
})
