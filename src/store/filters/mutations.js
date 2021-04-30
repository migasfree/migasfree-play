export function setCategories(state, value) {
  Object.entries(value).map(([key, val]) => {
    state.categories.push({
      id: parseInt(key),
      name: val
    })
  })
}

export function setSelectedCategory(state, value) {
  state.selectedCategory = value
}

export function setSearchApp(state, value) {
  state.searchApp = value
}

export function setOnlyInstalledApps(state, value) {
  state.onlyInstalledApps = value
}

export function setSearchDevice(state, value) {
  state.searchDevice = value
}

export function setOnlyAssignedDevices(state, value) {
  state.onlyAssignedDevices = value
}
