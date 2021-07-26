export function getAppsPackages(state) {
  let packages = []

  state.apps.forEach((value) => {
    if (value.packages_to_install.length > 0) {
      packages = packages.concat(value.packages_to_install)
    }
  })

  return packages
}

export function getApps(state) {
  return state.apps
}

export function userIsPrivileged(state) {
  return state.user.isPrivileged
}

export function host(state) {
  return state.host
}

export function status(state) {
  return state.status
}

export function stoppedApp(state) {
  return state.stopApp
}

export function token(state) {
  return state.tokenValue
}
