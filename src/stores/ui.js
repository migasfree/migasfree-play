import { ref } from 'vue'
import { defineStore } from 'pinia'
import { scroll, Notify } from 'quasar'

import { gettext } from 'boot/gettext'

import { useProgramStore } from './program.js'

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
      let msg

      switch (status) {
        case 401:
          msg = 'UnAuthorized'
          break
        case 404:
          msg = 'API Route is Missing or Undefined'
          break
        case 405:
          msg = 'API Route Method Not Allowed'
          break
        case 422:
          msg = 'Validation Error'
          break
        default:
          if (status >= 500) msg = 'Server Error'
      }

      if (typeof data === 'string') {
        return data
      }
      if (data && typeof data === 'object' && Object.keys(data).length) {
        return data[Object.keys(data)[0]]
      }
      return msg ?? ''
    }

    return error?.message ?? ''
  }

  const notifyError = (error) => {
    const message = getMessageFromError(error)

    if (message === gettext.$gettext('There is no connection to the server')) {
      const programStore = useProgramStore()
      programStore.setStatus(message)
      programStore.setStopApp()
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
