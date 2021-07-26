export function setComputerDevices(state, value) {
  state.default = value.default_logical_device
  state.assigned = value.assigned_logical_devices_to_cid
  state.inflicted = value.inflicted_logical_devices
}

export function setAvailableDevices(state, value) {
  state.available = value
}

export function addLogicalDevices(state, value) {
  state.available[value.index].logical = value.results
}

export function setLogicalAttributes(state, value) {
  for (let i = 0; i < state.available.length; i++) {
    for (let j = 0; j < state.available[i].logical.length; j++) {
      if (state.available[i].logical[j].id === value.index) {
        state.available[i].logical[j].attributes = value.results
        return
      }
    }
  }
}

export function addAssignedDevice(state, value) {
  state.assigned[state.assigned.length] = value
}

export function removeAssignedDevice(state, value) {
  for (let i = 0; i < state.assigned.length; i++) {
    if (state.assigned[i].id === value) {
      state.assigned.splice(i, 1)
      return
    }
  }
}
