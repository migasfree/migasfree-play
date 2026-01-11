import { ref } from 'vue'
import { defineStore } from 'pinia'
import { scroll, Notify } from 'quasar'

import { gettext } from 'boot/gettext'

const { getScrollTarget, setVerticalScrollPosition } = scroll

export const useUiStore = defineStore('ui', () => {
  const isLoading = ref(false)
  const isUpdating = ref(false)

  const scrollToElement = (element) => {
    const target = getScrollTarget(element)
    const offset = element.offsetTop
    const duration = 1000

    setVerticalScrollPosition(target, offset, duration)
  }

  const getMessageFromError = (error) => {
    if (typeof error === 'string') return error

    if (
      error?.code === 'ERR_NETWORK' ||
      (!error?.response && typeof error !== 'string')
    ) {
      return gettext.$gettext('There is no connection to the server')
    }

    if (error?.response) {
      const { status, data } = error.response
      const defaultMsg = status >= 500 ? 'Server Error' : ''

      const statusMap = {
        401: 'UnAuthorized',
        404: 'API Route is Missing or Undefined',
        405: 'API Route Method Not Allowed',
        422: 'Validation Error',
      }

      const msg = statusMap[status] ?? defaultMsg

      if (typeof data === 'string') return data
      if (data && typeof data === 'object' && Object.keys(data).length) {
        return data[Object.keys(data)[0]]
      }
      return msg
    }

    return error?.message ?? ''
  }

  const notifyError = (error) => {
    const message = getMessageFromError(error)

    if (message === gettext.$gettext('There is no connection to the server')) {
      // Lazy import to avoid circular dependency
      import('./program.js').then(({ useProgramStore }) => {
        const programStore = useProgramStore()
        programStore.setStatus(message)
        programStore.setStopApp()
      })
    }

    Notify.create({
      color: 'negative',
      position: 'bottom',
      icon: 'mdi-alert-circle-outline',
      message,
    })
  }

  const notifySuccess = (message) => {
    Notify.create({
      color: 'positive',
      position: 'bottom',
      icon: 'mdi-check-bold',
      message,
    })
  }

  const notifyInfo = (message) => {
    Notify.create({
      color: 'light-blue-3',
      position: 'bottom',
      textColor: 'black',
      icon: 'mdi-information-outline',
      message,
    })
  }

  const loading = () => {
    isLoading.value = true
  }

  const loadingFinished = () => {
    isLoading.value = false
  }

  const updating = () => {
    isUpdating.value = true
  }

  const updatingFinished = () => {
    isUpdating.value = false
  }

  return {
    isLoading,
    isUpdating,
    scrollToElement,
    notifyError,
    notifySuccess,
    notifyInfo,
    loading,
    loadingFinished,
    updating,
    updatingFinished,
  }
})
