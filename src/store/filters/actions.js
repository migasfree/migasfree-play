import { tokenApi } from 'config/app.conf'

export async function setCategories(context) {
  await this.$axios
    .get(`${context.rootState.app.initialUrl.token}${tokenApi.categories}`, {
      headers: { Authorization: context.rootState.app.tokenValue }
    })
    .then((response) => {
      context.commit('setCategories', response.data)
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}
