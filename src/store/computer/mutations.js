export function setComputerInfo(state, value) {
  state.uuid = value.uuid
  state.name = value.computer_name
  state.user = value.user
  state.project = value.project
}

export function setComputerId(state, value) {
  state.cid = value
}

export function setComputerLink(state, value) {
  // FIXME path
  state.link = `${value.protocol}://${value.host}/admin/client/computer/${value.cid}/`
}

export function setComputerData(state, value) {
  state.data = value
}

export function setComputerAttribute(state, value) {
  state.attribute = value
}

export function setComputerNetwork(state, value) {
  state.mask = value.mask
  state.network = value.network
}
