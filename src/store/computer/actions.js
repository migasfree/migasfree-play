import { internalApi, tokenApi } from 'config/app.conf'

export async function computerInfo(context) {
  await this.$axios
    .get(`${internalApi}/preferences/server`)
    .then((response) => {
      console.log('computerInfo', response)
      context.commit('setComputerInfo', response.data)
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}

export async function computerNetwork(context) {
  await this.$axios
    .get(`${internalApi}/computer/network`)
    .then((response) => {
      console.log('computerNetwork', response)
      context.commit('setComputerNetwork', response.data)
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}

export async function computerId(context) {
  await this.$axios
    .get(`${internalApi}/computer/id`)
    .then((response) => {
      console.log('computerId', response)
      context.commit('setComputerId', response.data)
      context.commit('setComputerLink', {
        protocol: context.rootState.app.protocol,
        host: context.rootState.app.host,
        cid: response.data
      })
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}

export async function computerData(context) {
  console.log('computerData', context.rootState)
  await this.$axios
    .get(
      `${context.rootState.app.initialUrl.token}${tokenApi.computer}${context.state.cid}/`,
      { headers: { Authorization: context.rootState.app.tokenValue } }
    )
    .then((response) => {
      context.commit('setComputerData', response.data)
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}

export async function computerAttribute(context) {
  await this.$axios
    .get(
      `${context.rootState.app.initialUrl.token}${tokenApi.cidAttribute}${context.state.cid}`,
      { headers: { Authorization: context.rootState.app.tokenValue } }
    )
    .then((response) => {
      if (response.data.count === 1)
        context.commit('setComputerAttribute', response.data.results[0].id)
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}
