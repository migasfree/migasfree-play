import { internalApi } from 'config/app.conf'
import { Dark, LocalStorage } from 'quasar'

export async function readPreferences(context) {
  await this.$axios
    .get(`${internalApi}/preferences`)
    .then((response) => {
      context.commit('setPreferences', response.data)
      this.$gettext.current = response.data.language
      Dark.set(response.data.dark_mode)
      LocalStorage.set('darkMode', response.data.dark_mode)
    })
    .catch((error) => {
      if (!error.response) {
        context.commit(
          'app/setStatus',
          this.$gettext.$gettext('There is no connection to the server'),
          { root: true }
        )
        context.commit('app/stopApp', null, { root: true })
      } else context.dispatch('ui/notifyError', error, { root: true })
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
      show_help: context.state.showHelp,
      dark_mode: context.state.darkMode,
      show_dark_mode: context.state.showDarkMode,
    })
    .then(() => {
      Dark.set(context.state.darkMode)
      LocalStorage.set('darkMode', context.state.darkMode)
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}
