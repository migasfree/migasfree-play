import Vue from 'vue'
import axios from 'axios'

export const cancelSource = axios.CancelToken.source()

const axiosInstance = axios.create({
  paramsSerializer: (params) => {
    return qs.stringify(params, { arrayFormat: 'repeat' })
  }
})

axiosInstance.interceptors.request.use(
  (config) => {
    /* const authToken = LocalStorage.getItem('auth.token')

    if (authToken) {
      config.headers.Authorization = `Token ${authToken}`
    } */ // TODO

    config.headers['Accept-Language'] = `${Vue.config.language.replace(
      '_',
      '-'
    )},${Vue.config.language.split('_')[0]};q=0.9`

    // config.timeout = 10000
    config.cancelToken = cancelSource.token

    console.log('[ REQUEST ]', config.url, config.params, config.headers)

    return config
  },

  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('[ RESPONSE ]', response.config.url, response)
    return response
  },

  (error) => {
    // TODO https://haxzie.com/architecting-http-clients-vue-js-network-layer
    console.error(error.response.status, error.message)
    return Promise.reject(error)
  }
)

export default ({ store, Vue }) => {
  Vue.prototype.$axios = axiosInstance
  store.$axios = axiosInstance
}
