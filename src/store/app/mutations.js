import { publicApi, tokenApi } from 'config/app.conf'

export function setInitialUrl(state) {
  state.initialUrl.baseDomain = `${state.protocol}://${state.host}`
  state.initialUrl.public = `${state.initialUrl.baseDomain}${publicApi.prefix}`
  state.initialUrl.token = `${state.initialUrl.baseDomain}${tokenApi.prefix}`
}

export function setToken(state, value) {
  state.tokenValue = `Token ${value}`
}

export function setTokenChecked(state, value) {
  state.tokenChecked = value
}

export function setServerVersion(state, value) {
  state.serverVersion = value
}

export function setServerHost(state, value) {
  state.host = value.server
}

export function setApiProcotol(state, value) {
  state.protocol = value
}

export function setApps(state, { value, project }) {
  state.apps = []
  value.forEach((item) => {
    let filterPackages = item.packages_by_project.filter(
      (packages) => project === packages.project.name
    )
    if (filterPackages.length > 0) {
      item.packages_to_install = filterPackages[0].packages_to_install
      state.apps.push(item)
    }
  })
}

export function privilegedUser(state) {
  state.user.isPrivileged = true
}

export function setStatus(state, value) {
  state.status = value
}
