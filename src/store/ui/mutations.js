export function loading(state) {
  state.isLoading = true
}

export function loadingFinished(state) {
  state.isLoading = false
}

export function updating(state) {
  state.isUpdating = true
}

export function updatingFinished(state) {
  state.isUpdating = false
}
