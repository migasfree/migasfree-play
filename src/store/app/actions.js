import {
  tokenAuth,
  publicApi,
  tokenApi,
  internalApi,
  checkTokenApi,
} from 'config/app.conf'

require('dotenv').config()

export async function init(context) {
  context.commit('ui/loading', null, { root: true })

  context.commit('setStatus', this.$gettext.$gettext('Preferences'))
  await context.dispatch('preferences/readPreferences', {}, { root: true })
  if (context.rootGetters['app/stoppedApp']) return
  await context.dispatch('apiProtocol')
  await context.dispatch('serverHost')

  context.commit('setInitialUrl')

  context.commit('setStatus', this.$gettext.$gettext('Server'))
  await context.dispatch('serverInfo')
  if (context.rootGetters['app/stoppedApp']) return
  await context.dispatch('getToken')
  await context.dispatch('checkToken')
  if (context.rootGetters['app/stoppedApp']) return
  if (!context.state.tokenChecked) {
    await context.dispatch('getToken')
  }

  context.commit('setStatus', this.$gettext.$gettext('Computer'))
  await context.dispatch('computer/computerInfo', {}, { root: true })
  await context.dispatch('computer/computerNetwork', {}, { root: true })
  await context.dispatch('computer/computerId', {}, { root: true })
  await context.dispatch('computer/computerData', {}, { root: true })
  await context.dispatch('computer/computerAttribute', {}, { root: true })

  context.commit('setStatus', this.$gettext.$gettext('Apps'))
  await context.dispatch('getApps')

  context.commit('setStatus', this.$gettext.$gettext('Categories'))
  await context.dispatch('filters/setCategories', {}, { root: true })

  context.commit('setStatus', this.$gettext.$gettext('Packages'))
  await context.dispatch('packages/setAvailablePackages', {}, { root: true })
  await context.dispatch('packages/setInstalledPackages', {}, { root: true })

  await context.dispatch('executions/getExecutions', {}, { root: true })

  context.commit('setStatus', this.$gettext.$gettext('Devices'))
  await context.dispatch('devices/computerDevices', {}, { root: true })
  await context.dispatch('devices/getAvailableDevices', {}, { root: true })
  await context.dispatch('devices/getFeaturesDevices', {}, { root: true })

  context.commit('setStatus', this.$gettext.$gettext('Tags'))
  await context.dispatch('tags/getAvailableTags', {}, { root: true })
  await context.dispatch('tags/getAssignedTags', {}, { root: true })

  context.commit('setStatus', '')
  context.commit('ui/loadingFinished', null, { root: true })
}

export async function serverInfo(context) {
  await this.$axios
    .post(`${context.state.initialUrl.public}${publicApi.serverInfo}`)
    .then((response) => {
      context.commit('setServerVersion', response.data.version)
    })
    .catch((error) => {
      if (!error.response) {
        context.commit(
          'setStatus',
          this.$gettext.$gettext('There is no connection to the server')
        )
        context.commit('stopApp')
      } else context.dispatch('ui/notifyError', error, { root: true })
    })
}

export async function getToken(context) {
  let response = await this.$axios.get(`${internalApi}/token`)
  if (!'data' in response || !response.data.token) {
    response = await this.$axios
      .post(
        `${context.state.protocol}://${context.state.host}${tokenAuth.url}`,
        {
          username: process.env.MIGASFREE_USER || 'migasfree-play',
          password: process.env.MIGASFREE_PASSWORD || 'migasfree-play',
        }
      )
      .catch((error) => {
        if (error.response.status === 400) {
          context.commit(
            'setStatus',
            this.$gettext.$gettext(
              'Credentials are not valid. Review app settings.'
            )
          )
          context.commit('stopApp')
        }
      })
    if (response && response.data.token) {
      await this.$axios.post(`${internalApi}/token`, {
        token: response.data.token,
      })
    }
  }

  context.commit('setToken', response ? response.data.token : '')
}

export async function checkToken(context) {
  await this.$axios
    .get(
      `${context.state.protocol}://${context.state.host}${checkTokenApi.url}`,
      {
        headers: {
          Authorization: context.state.tokenValue,
        },
      }
    )
    .then(() => {
      context.commit('setTokenChecked', true)
    })
    .catch((error) => {
      if (!error.response) {
        context.commit(
          'setStatus',
          this.$gettext.$gettext('There is no connection to the server')
        )
        context.commit('stopApp')
      } else {
        if (error.response.status === 403) {
          this.$axios.post(`${internalApi}/token`, {
            token: '',
          })
          context.commit('setTokenChecked', false)
        }
      }
    })
}

export async function checkUser(context, { user, password }) {
  await this.$axios
    .post(`${internalApi}/user/check`, {
      user,
      password,
    })
    .then((response) => {
      if (response.data.is_privileged) {
        context.commit('privilegedUser')
      } else {
        context.dispatch(
          'ui/notifyError',
          this.$gettext.$gettext('User without privileges'),
          { root: true }
        )
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

  await this.$axios
    .get(
      `${context.state.initialUrl.token}${tokenApi.apps}${computer.cid}&page_size=${Number.MAX_SAFE_INTEGER}`,
      {
        headers: {
          Authorization: context.state.tokenValue,
        },
      }
    )
    .then((response) => {
      context.commit('setApps', {
        value: response.data.results,
        project: computer.project,
      })
    })
    .catch((error) => {
      context.dispatch('ui/notifyError', error, { root: true })
    })
}
