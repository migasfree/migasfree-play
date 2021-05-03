import { tokenAuth, publicApi, tokenApi, internalApi } from 'config/app.conf'

export async function init(context) {
  context.commit('ui/loading', null, { root: true })

  await context.dispatch('preferences/readPreferences', {}, { root: true })
  await context.dispatch('apiProtocol')
  await context.dispatch('serverHost')

  context.commit('setInitialUrl')

  await context.dispatch('computer/computerInfo', {}, { root: true })
  await context.dispatch('computer/computerNetwork', {}, { root: true })
  await context.dispatch('computer/computerId', {}, { root: true })

  await context.dispatch('packages/setAvailablePackages', {}, { root: true })

  await context.dispatch('serverInfo')
  await context.dispatch('getToken')
  await context.dispatch('getApps')

  await context.dispatch('computer/computerData', {}, { root: true })
  await context.dispatch('computer/computerAttribute', {}, { root: true })
  await context.dispatch('packages/setInstalledPackages', {}, { root: true })
  await context.dispatch('filters/setCategories', {}, { root: true })
  await context.dispatch('executions/getExecutions', {}, { root: true })

  await context.dispatch('devices/computerDevices', {}, { root: true })
  await context.dispatch('devices/getAvailableDevices', {}, { root: true })
  await context.dispatch('devices/getFeaturesDevices', {}, { root: true })

  await context.dispatch('tags/getAvailableTags', {}, { root: true })
  await context.dispatch('tags/getAssignedTags', {}, { root: true })

  context.commit('ui/finished', null, { root: true })
}

export async function serverInfo(context) {
  console.log(`${context.state.initialUrl.public}${publicApi.serverInfo}`)
  await this.$axios
    .post(`${context.state.initialUrl.public}${publicApi.serverInfo}`)
    .then((response) => {
      context.commit('setServerVersion', response.data.version)
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}

export async function getToken(context) {
  let response = await this.$axios.get(`${internalApi}/token`)
  console.log('getToken **************', response)
  if (!response.data.token) {
    response = await this.$axios.post(
      `${context.state.protocol}://${context.state.host}${tokenAuth.url}`,
      {
        username: tokenAuth.user,
        password: tokenAuth.password
      }
    )
    console.log('getToken again', response)
    if (response.data.token) {
      console.log(response.data.token)
      await this.$axios.post(`${internalApi}/token`, {
        token: response.data.token
      })
    }
  }

  context.commit('setToken', response.data.token)
}

export async function checkUser(context, { user, password }) {
  await this.$axios
    .post(`${internalApi}/user/check`, {
      user,
      password
    })
    .then((response) => {
      if (response.data.is_privileged) {
        context.commit('privilegedUser')
      }
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}

export async function apiProtocol(context) {
  await this.$axios
    .get(`${internalApi}/preferences/protocol`)
    .then((response) => {
      context.commit('setApiProcotol', response.data)
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}

export async function serverHost(context) {
  await this.$axios
    .get(`${internalApi}/preferences/server`)
    .then((response) => {
      context.commit('setServerHost', response.data)
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}

export async function getApps(context) {
  const computer = context.rootGetters['computer/getComputer']
  console.log('getApps ************', computer)

  await this.$axios
    .get(
      `${context.state.initialUrl.token}${tokenApi.apps}${computer.cid}&page_size=${Number.MAX_SAFE_INTEGER}`,
      {
        headers: {
          Authorization: context.state.tokenValue
        }
      }
    )
    .then((response) => {
      context.commit('setApps', {
        value: response.data.results,
        project: computer.project
      })
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}
