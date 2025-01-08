import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Dark, LocalStorage } from 'quasar'

import { api } from 'boot/axios'
import { gettext } from 'boot/gettext'

import { useUiStore } from './ui.js'

import { internalApi } from 'config/app.conf'

export const usePreferencesStore = defineStore('preferences', () => {
  const language = ref('es_ES')
  const showLanguage = ref(true)
  const showComputerLink = ref(true)
  const showSyncDetails = ref(false)
  const showApps = ref(true)
  const showDevices = ref(true)
  const showTags = ref(true)
  const showDetails = ref(true)
  const showPreferences = ref(true)
  const showInfo = ref(true)
  const showHelp = ref(true)
  const darkMode = ref(false)
  const showDarkMode = ref(true)

  async function readPreferences() {
    const uiStore = useUiStore()

    await api
      .get(`${internalApi}/preferences`)
      .then((response) => {
        setPreferences(response.data)
        gettext.current = response.data.language
        Dark.set(response.data.dark_mode)
        LocalStorage.set('darkMode', response.data.dark_mode)
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
  }

  function savePreferences() {
    const uiStore = useUiStore()

    api
      .post(`${internalApi}/preferences`, {
        language: language.value,
        show_language: showLanguage.value,
        show_computer_link: showComputerLink.value,
        show_sync_details: showSyncDetails.value,
        show_apps: showApps.value,
        show_devices: showDevices.value,
        show_tags: showTags.value,
        show_details: showDetails.value,
        show_preferences: showPreferences.value,
        show_info: showInfo.value,
        show_help: showHelp.value,
        dark_mode: darkMode.value,
        show_dark_mode: showDarkMode.value,
      })
      .then(() => {
        Dark.set(darkMode.value)
        LocalStorage.set('darkMode', darkMode.value)
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
  }

  function setPreferences(value) {
    language.value = value.language
    showLanguage.value = value.show_language
    showComputerLink.value = value.show_computer_link
    showSyncDetails.value = value.show_sync_details
    showApps.value = value.show_apps
    showDevices.value = value.show_devices
    showTags.value = value.show_tags
    showDetails.value = value.show_details
    showPreferences.value = value.show_preferences
    showInfo.value = value.show_info
    showHelp.value = value.show_help
    darkMode.value = value.dark_mode
    showDarkMode.value = value.show_dark_mode
  }

  function setLanguage(value) {
    language.value = value
    gettext.current = value
  }

  return {
    language,
    showLanguage,
    showComputerLink,
    showSyncDetails,
    showApps,
    showDevices,
    showTags,
    showDetails,
    showPreferences,
    showInfo,
    showHelp,
    darkMode,
    showDarkMode,
    readPreferences,
    savePreferences,
    setLanguage,
  }
})
