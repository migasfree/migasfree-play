import { ref } from 'vue'
import { defineStore } from 'pinia'
import { scroll, Notify } from 'quasar'

import { gettext } from 'boot/gettext'

import { useProgramStore } from './program'

const { getScrollTarget, setVerticalScrollPosition } = scroll

export const useUiStore = defineStore('ui', () => {
  const isLoading = ref(false)
  const isUpdating = ref(false)

  function scrollToElement(element) {
    const target = getScrollTarget(element)
    const offset = element.offsetTop
    const duration = 1000

    setVerticalScrollPosition(target, offset, duration)
  }

  function notifyError(error) {
    let message = ''

    // Setup Error Message
    if (typeof error !== 'undefined') {
      if (error.hasOwnProperty('message')) {
        message = error.message
      }
    }

    if (
      (error.hasOwnProperty('code') && error.code === 'ERR_NETWORK') ||
      (typeof error !== 'string' && !error.response)
    ) {
      message = gettext.$gettext('There is no connection to the server')

      const programStore = useProgramStore()
      programStore.setStatus(message)
      programStore.setStopApp()

      Notify.create({
        color: 'negative',
        position: 'bottom',
        message,
        icon: 'mdi-alert-circle-outline',
      })

      return
    }

    if (typeof error.response !== 'undefined') {
      // Setup Generic Response Messages
      if (error.response.status === 401) {
        message = 'UnAuthorized'
        // vm.$emit('logout') // Emit Logout Event
      } else if (error.response.status === 404) {
        message = 'API Route is Missing or Undefined'
      } else if (error.response.status === 405) {
        message = 'API Route Method Not Allowed'
      } else if (error.response.status === 422) {
        // Validation Message
      } else if (error.response.status >= 500) {
        message = 'Server Error'
      }

      // Try to Use the Response Message
      if (
        error.hasOwnProperty('response') &&
        error.response.hasOwnProperty('data') &&
        typeof error.response.data !== 'undefined'
      ) {
        if (typeof error.response.data === 'string') {
          message = error.response.data
        } else if (Object.keys(error.response.data).length > 0) {
          message = error.response.data[Object.keys(error.response.data)[0]]
        }
      }
    }

    if (typeof error === 'string') {
      message = error
    }

    Notify.create({
      color: 'negative',
      position: 'bottom',
      message,
      icon: 'mdi-alert-circle-outline',
    })
  }

  function notifySuccess(message) {
    Notify.create({
      color: 'positive',
      position: 'bottom',
      message,
      icon: 'mdi-check-bold',
    })
  }

  function notifyInfo(message) {
    Notify.create({
      color: 'info',
      position: 'bottom',
      message,
      icon: 'mdi-information',
    })
  }

  function loading() {
    isLoading.value = true
  }

  function loadingFinished() {
    isLoading.value = false
  }

  function updating() {
    isUpdating.value = true
  }

  function updatingFinished() {
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
