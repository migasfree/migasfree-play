import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePreferencesStore } from 'src/stores/preferences'

// Mock Quasar's Dark and LocalStorage
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

const mockUiStore = {
  notifyError: vi.fn(),
  notifySuccess: vi.fn(),
}
vi.mock('src/stores/ui', () => ({
  useUiStore: () => mockUiStore,
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
  dark_mode: 'dark',
  show_dark_mode: true,
}

describe('Preferences Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    window.electronAPI.preferences.read.mockResolvedValue(mockPreferencesData)
    window.electronAPI.preferences.write.mockResolvedValue(undefined)
    window.electronAPI.theme = {
      shouldUseDarkColors: vi.fn().mockResolvedValue(true),
      onNativeThemeUpdated: vi.fn(),
    }
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

    it('has default darkMode system', () => {
      const store = usePreferencesStore()
      expect(store.darkMode).toBe('system')
    })
  })

  describe('readPreferences()', () => {
    it('fetches and sets all preference values', async () => {
      const store = usePreferencesStore()
      await store.readPreferences()

      expect(window.electronAPI.preferences.read).toHaveBeenCalled()
      expect(store.language).toBe('en_US')
      expect(store.showLanguage).toBe(true)
      expect(store.showComputerLink).toBe(true)
      expect(store.showSyncDetails).toBe(false)
      expect(store.showApps).toBe(true)
      expect(store.showDevices).toBe(true)
      expect(store.showTags).toBe(true)
      expect(store.darkMode).toBe('dark')
    })

    it('migrates legacy boolean true dark_mode to "dark"', async () => {
      window.electronAPI.preferences.read.mockResolvedValue({
        ...mockPreferencesData,
        dark_mode: true,
      })
      const store = usePreferencesStore()
      await store.readPreferences()
      expect(store.darkMode).toBe('dark')
    })

    it('migrates legacy boolean false dark_mode to "light"', async () => {
      window.electronAPI.preferences.read.mockResolvedValue({
        ...mockPreferencesData,
        dark_mode: false,
      })
      const store = usePreferencesStore()
      await store.readPreferences()
      expect(store.darkMode).toBe('light')
    })

    it('sets dark mode via Quasar for "dark" value', async () => {
      const { Dark, LocalStorage } = await import('quasar')

      const store = usePreferencesStore()
      await store.readPreferences()

      expect(Dark.set).toHaveBeenCalledWith(true)
      expect(LocalStorage.set).toHaveBeenCalledWith('darkMode', 'dark')
    })

    it('sets dark mode from nativeTheme for "system" value (dark OS)', async () => {
      const { Dark, LocalStorage } = await import('quasar')
      window.electronAPI.preferences.read.mockResolvedValue({
        ...mockPreferencesData,
        dark_mode: 'system',
      })
      window.electronAPI.theme.shouldUseDarkColors.mockResolvedValue(true)

      const store = usePreferencesStore()
      await store.readPreferences()

      expect(Dark.set).toHaveBeenCalledWith(true)
      expect(LocalStorage.set).toHaveBeenCalledWith('darkMode', 'system')
    })

    it('sets light mode from nativeTheme for "system" value (light OS)', async () => {
      const { Dark, LocalStorage } = await import('quasar')
      window.electronAPI.preferences.read.mockResolvedValue({
        ...mockPreferencesData,
        dark_mode: 'system',
      })
      window.electronAPI.theme.shouldUseDarkColors.mockResolvedValue(false)

      const store = usePreferencesStore()
      await store.readPreferences()

      expect(Dark.set).toHaveBeenCalledWith(false)
      expect(LocalStorage.set).toHaveBeenCalledWith('darkMode', 'system')
    })

    it('registers nativeTheme listener', async () => {
      const store = usePreferencesStore()
      await store.readPreferences()
      expect(window.electronAPI.theme.onNativeThemeUpdated).toHaveBeenCalled()
    })

    it('handles API errors', async () => {
      window.electronAPI.preferences.read.mockRejectedValue(
        new Error('IPC Error'),
      )

      const store = usePreferencesStore()
      await store.readPreferences()

      expect(store.language).toBe('es_ES')
    })
  })

  describe('savePreferences()', () => {
    it('posts all preferences', async () => {
      const store = usePreferencesStore()
      store.language = 'ca_ES'
      store.darkMode = 'dark'
      await store.savePreferences()

      expect(window.electronAPI.preferences.write).toHaveBeenCalledWith(
        expect.objectContaining({
          language: 'ca_ES',
          dark_mode: 'dark',
          show_apps: true,
        }),
      )
      expect(mockUiStore.notifySuccess).toHaveBeenCalledWith(
        'Preferences saved successfully',
      )
    })

    it('sets dark mode after saving with "dark" value', async () => {
      const { Dark, LocalStorage } = await import('quasar')

      const store = usePreferencesStore()
      store.darkMode = 'dark'
      await store.savePreferences()

      expect(Dark.set).toHaveBeenCalledWith(true)
      expect(LocalStorage.set).toHaveBeenCalledWith('darkMode', 'dark')
    })

    it('sets dark mode from nativeTheme after saving with "system" value (dark OS)', async () => {
      const { Dark, LocalStorage } = await import('quasar')
      window.electronAPI.theme.shouldUseDarkColors.mockResolvedValue(true)

      const store = usePreferencesStore()
      store.darkMode = 'system'
      await store.savePreferences()

      expect(Dark.set).toHaveBeenCalledWith(true)
      expect(LocalStorage.set).toHaveBeenCalledWith('darkMode', 'system')
    })

    it('sets light mode after saving with "light" value', async () => {
      const { Dark, LocalStorage } = await import('quasar')

      const store = usePreferencesStore()
      store.darkMode = 'light'
      await store.savePreferences()

      expect(Dark.set).toHaveBeenCalledWith(false)
      expect(LocalStorage.set).toHaveBeenCalledWith('darkMode', 'light')
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
