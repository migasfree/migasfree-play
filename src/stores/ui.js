import { defineStore } from 'pinia'
import { scroll, Notify } from 'quasar'

import { gettext } from 'boot/gettext'

import { useAppStore } from './app'

const { getScrollTarget, setVerticalScrollPosition } = scroll

export const useUiStore = defineStore('ui', {
  state: () => ({
    isLoading: false,
    isUpdating: false,
  }),
  actions: {
    scrollToElement(element) {
      const target = getScrollTarget(element)
      const offset = element.offsetTop
      const duration = 1000

      setVerticalScrollPosition(target, offset, duration)
    },

    notifyError(error) {
      let message = ''

      // Setup Error Message
      if (typeof error !== undefined) {
        if (error.hasOwnProperty('message')) {
          message = error.message
        }
      }

      if (
        (error.hasOwnProperty('code') && error.code === 'ERR_NETWORK') ||
        !error.response
      ) {
        const appStore = useAppStore()
        console.log(appStore)

        appStore.setStatus(
          gettext.$gettext('There is no connection to the server')
        )
        appStore.setStopApp()

        return
      }
      if (typeof error.response !== undefined) {
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
          error.response.data !== undefined
        ) {
          if (Object.keys(error.response.data).length > 0) {
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
    },

    notifySuccess(message) {
      Notify.create({
        color: 'positive',
        position: 'bottom',
        message,
        icon: 'mdi-check-bold',
      })
    },

    notifyInfo(message) {
      Notify.create({
        color: 'info',
        position: 'bottom',
        message,
        icon: 'mdi-check-bold',
      })
    },

    loading() {
      this.isLoading = true
    },

    loadingFinished() {
      this.isLoading = false
    },

    updating() {
      this.isUpdating = true
    },

    updatingFinished() {
      this.isUpdating = false
    },
  },
})
