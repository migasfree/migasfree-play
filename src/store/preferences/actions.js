import { internalApi } from 'config/app.conf'

export async function readPreferences(context) {
  await this.$axios
    .get(`${internalApi}/preferences`)
    .then((response) => {
      context.commit('setPreferences', response.data)
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}

export function savePreferences(context) {
  this.$axios
    .post(`${internalApi}/preferences`, {
      language: context.state.language,
      show_computer_link: context.state.showComputerLink,
      show_sync_details: context.state.showSyncDetails,
      show_apps: context.state.showApps,
      show_devices: context.state.showDevices,
      show_tags: context.state.showTags,
      show_details: context.state.showDetails,
      show_preferences: context.state.showPreferences,
      show_info: context.state.showInfo,
      show_help: context.state.showHelp
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}
