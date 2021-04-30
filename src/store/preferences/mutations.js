import Vue from 'vue'

export function setPreferences(state, value) {
  state.language = value.language
  Vue.config.language = state.language
  state.showSyncDetails = value.show_sync_details
  state.showApps = value.show_apps
  state.showDevices = value.show_devices
  state.showTags = value.show_tags
  state.showDetails = value.show_details
  state.showPreferences = value.show_preferences
  state.showInfo = value.show_info
  state.showHelp = value.show_help
}

export function setLanguage(state, value) {
  state.language = value
  Vue.config.language = state.language
}

export function setShowSyncDetails(state, value) {
  state.showSyncDetails = value
}
