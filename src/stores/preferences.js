import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Dark, LocalStorage } from 'quasar'

import { api } from 'boot/axios'
import { gettext } from 'boot/gettext'

import { useUiStore } from './ui.js'

import { internalApi } from 'config/app.conf'

export const usePreferencesStore = defineStore('preferences', () => {
  const uiStore = useUiStore()

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

  const readPreferences = async () => {
    try {
      const { data } = await api.get(`${internalApi}/preferences`)

      setPreferences(data)
      gettext.current = data.language
      Dark.set(data.dark_mode)
      LocalStorage.set('darkMode', data.dark_mode)
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const savePreferences = async () => {
    const payload = {
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
    }

    try {
      await api.post(`${internalApi}/preferences`, payload)
      Dark.set(darkMode.value)
      LocalStorage.set('darkMode', darkMode.value)
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const setPreferences = (value) => {
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

  const setLanguage = (value) => {
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
