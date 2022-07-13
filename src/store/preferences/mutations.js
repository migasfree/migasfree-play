export function setPreferences(state, value) {
  state.language = value.language
  state.showComputerLink = value.show_computer_link
  state.showSyncDetails = value.show_sync_details
  state.showApps = value.show_apps
  state.showDevices = value.show_devices
  state.showTags = value.show_tags
  state.showDetails = value.show_details
  state.showPreferences = value.show_preferences
  state.showInfo = value.show_info
  state.showHelp = value.show_help
  state.darkMode = value.dark_mode
  state.showDarkMode = value.show_dark_mode
}

export function setLanguage(state, value) {
  state.language = value
}

export function setShowSyncDetails(state, value) {
  state.showSyncDetails = value
}

export function setDarkMode(state, value) {
  state.darkMode = value
}
