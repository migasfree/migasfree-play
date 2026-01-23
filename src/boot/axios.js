import { storeToRefs } from 'pinia'
import { boot } from 'quasar/wrappers'
import axios from 'axios'

import { usePreferencesStore } from 'src/stores/preferences'

export const cancelSource = axios.CancelToken.source()

const api = axios.create()

// Override console to ensure logs reach the main process log file
if (window.electronAPI) {
  const originalLog = console.log
  const originalError = console.error
  const originalWarn = console.warn
  const originalDebug = console.debug

  const serialize = (arg) => {
    if (arg === null) return 'null'
    if (arg === undefined) return 'undefined'
    if (arg instanceof Error) {
      return JSON.stringify(
        Object.getOwnPropertyNames(arg).reduce((acc, key) => {
          acc[key] = arg[key]
          return acc
        }, {}),
      )
    }
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg)
      } catch {
        return String(arg)
      }
    }
    return String(arg)
  }

  console.log = (...args) => {
    originalLog.apply(console, args)
    window.electronAPI.log(args.map(serialize).join(' '), 'INFO')
  }

  console.error = (...args) => {
    originalError.apply(console, args)
    window.electronAPI.log(args.map(serialize).join(' '), 'ERROR')
  }

  console.warn = (...args) => {
    originalWarn.apply(console, args)
    window.electronAPI.log(args.map(serialize).join(' '), 'WARN')
  }

  console.debug = (...args) => {
    originalDebug.apply(console, args)
    window.electronAPI.log(args.map(serialize).join(' '), 'DEBUG')
  }
}

export default boot(({ app, store }) => {
  api.interceptors.request.use(
    (config) => {
      /* const appStore = useAppStore(store)
      const { token } = storeToRefs(appStore)

      if (token.value) {
        config.headers.Authorization = token.value
      } */ // TODO

      const preferencesStore = usePreferencesStore(store)
      const { language } = storeToRefs(preferencesStore)

      config.headers['Accept-Language'] = `${language.value.replace(
        '_',
        '-',
      )},${language.value.split('_')[0]};q=0.9`

      // config.timeout = 10000
      config.cancelToken = cancelSource.token

      const message = `[ REQUEST ] ${config.url} ${JSON.stringify(config.params)} ${JSON.stringify(config.headers)}`
      console.debug(message)

      return config
    },

    (error) => {
      return Promise.reject(error)
    },
  )

  api.interceptors.response.use(
    (response) => {
      const message = `[ RESPONSE ] ${response.config.url} ${JSON.stringify(response.data)}`
      console.debug(message)
      return response
    },

    (error) => {
      let message = ''
      if (error.response) {
        message = `[ RESPONSE ERROR ] ${error.config.url} ${error.response.status} ${JSON.stringify(error.response.data)}`
      } else {
        message = `[ REQUEST ERROR ] ${error.message}`
      }

      console.error(message)

      return Promise.reject(error)
    },
  )

  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API

  store.$axios = api
})

export { axios, api }
