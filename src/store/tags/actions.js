import { internalApi } from 'config/app.conf'

export async function getAvailableTags(context) {
  await this.$axios
    .get(`${internalApi}/tags/available`)
    .then((response) => {
      context.commit('setAvailableTags', response.data)
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}

export async function getAssignedTags(context) {
  await this.$axios
    .get(`${internalApi}/tags/assigned`)
    .then((response) => {
      context.commit('setAssignedTags', response.data)
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}
