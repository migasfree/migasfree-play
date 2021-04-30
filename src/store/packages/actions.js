import { internalApi } from 'config/app.conf'

export async function setAvailablePackages(context) {
  await this.$axios
    .get(`${internalApi}/packages/available`)
    .then((response) => {
      context.commit('setAvailablePackages', response.data)
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}

export async function setInstalledPackages(context) {
  await this.$axios
    .post(
      `${internalApi}/packages/installed`,
      context.rootGetters.getAppsPackages
    )
    .then((response) => {
      context.commit('setInstalledPackages', response.data)
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}
