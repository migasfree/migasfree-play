import { defineStore } from 'pinia'
import { Dark, LocalStorage } from 'quasar'

import { api } from 'boot/axios'
import { gettext } from 'boot/gettext'

import { useUiStore } from './ui'

import { internalApi } from 'config/app.conf'

export const usePreferencesStore = defineStore('preferences', {
  state: () => ({
    language: 'es_ES',
    showComputerLink: true,
    showSyncDetails: false,
    showApps: true,
    showDevices: true,
    showTags: true,
    showDetails: true,
    showPreferences: true,
    showInfo: true,
    showHelp: true,
    darkMode: false,
    showDarkMode: true,
  }),
  getters: {
    getLanguage: (state) => state.language,
  },
  actions: {
    async readPreferences() {
      const uiStore = useUiStore()

      await api
        .get(`${internalApi}/preferences`)
        .then((response) => {
          this.setPreferences(response.data)
          gettext.current = response.data.language
          Dark.set(response.data.dark_mode)
          LocalStorage.set('darkMode', response.data.dark_mode)
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    },

    savePreferences() {
      const uiStore = useUiStore()

      api
        .post(`${internalApi}/preferences`, {
          language: this.language,
          show_computer_link: this.showComputerLink,
          show_sync_details: this.showSyncDetails,
          show_apps: this.showApps,
          show_devices: this.showDevices,
          show_tags: this.showTags,
          show_details: this.showDetails,
          show_preferences: this.showPreferences,
          show_info: this.showInfo,
          show_help: this.showHelp,
          dark_mode: this.darkMode,
          show_dark_mode: this.showDarkMode,
        })
        .then(() => {
          Dark.set(this.darkMode)
          LocalStorage.set('darkMode', this.darkMode)
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    },

    setPreferences(value) {
      this.language = value.language
      this.showComputerLink = value.show_computer_link
      this.showSyncDetails = value.show_sync_details
      this.showApps = value.show_apps
      this.showDevices = value.show_devices
      this.showTags = value.show_tags
      this.showDetails = value.show_details
      this.showPreferences = value.show_preferences
      this.showInfo = value.show_info
      this.showHelp = value.show_help
      this.darkMode = value.dark_mode
      this.showDarkMode = value.show_dark_mode
    },

    setLanguage(value) {
      this.language = value
      gettext.current = value
    },
  },
})
