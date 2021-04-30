import { tokenApi } from 'config/app.conf'

export async function computerDevices(context) {
  await this.$axios
    .get(
      `${context.rootState.app.initialUrl.token}${tokenApi.computer}${context.rootState.computer.cid}/devices/`,
      { headers: { Authorization: context.rootState.app.tokenValue } }
    )
    .then((response) => {
      context.commit('setComputerDevices', response.data)
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}

export async function getAvailableDevices(context) {
  const computer = context.rootGetters['computer/getComputer']

  await this.$axios
    .get(
      `${context.rootState.app.initialUrl.token}${tokenApi.availableDevices}${computer.cid}&page_size=${Number.MAX_SAFE_INTEGER}`,
      { headers: { Authorization: context.rootState.app.tokenValue } }
    )
    .then((response) => {
      context.commit('setAvailableDevices', response.data.results)
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}

export async function getFeaturesDevices(context) {
  context.state.available.forEach((item, index) => {
    context.dispatch('getLogicalDevice', { id: item.id, index })
  })
}

export async function getLogicalDevice(context, { id, index }) {
  await this.$axios
    .get(
      `${context.rootState.app.initialUrl.token}${tokenApi.availableLogicalDevices}${context.rootState.computer.cid}&did=${id}`,
      { headers: { Authorization: context.rootState.app.tokenValue } }
    )
    .then((response) => {
      if (response.data.results) {
        let payload = {}
        payload.results = response.data.results
        payload.index = index
        context.commit('addLogicalDevices', payload)
      }
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}

export function changeDeviceAttributes(
  context,
  { id, attributes, element = null }
) {
  this.$axios
    .patch(
      `${context.rootState.app.initialUrl.token}${tokenApi.logicalDevice}${id}/`,
      { attributes },
      { headers: { Authorization: context.rootState.app.tokenValue } }
    )
    .then((response) => {
      if (response.data.id) {
        let payload = {}
        payload.results = response.data.attributes
        payload.index = id
        context.commit('setLogicalAttributes', payload)
        if (element) element.disabled = false
      }
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}
