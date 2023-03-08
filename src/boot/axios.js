import { storeToRefs } from 'pinia'
import { boot } from 'quasar/wrappers'
import axios from 'axios'

import { usePreferencesStore } from 'src/stores/preferences'

export const cancelSource = axios.CancelToken.source()

const api = axios.create()

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
        '-'
      )},${language.value.split('_')[0]};q=0.9`

      // config.timeout = 10000
      config.cancelToken = cancelSource.token

      console.log('[ REQUEST ]', config.url, config.params, config.headers)

      return config
    },

    (error) => {
      return Promise.reject(error)
    }
  )

  api.interceptors.response.use(
    (response) => {
      console.log('[ RESPONSE ]', response.config.url, response)
      return response
    },

    (error) => {
      // TODO https://haxzie.com/architecting-http-clients-vue-js-network-layer
      if ('response' in error)
        console.error(error.response.status, error.message)
      else console.error(error)

      return Promise.reject(error)
    }
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
