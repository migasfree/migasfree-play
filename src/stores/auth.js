import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import { api } from 'boot/axios'
import { gettext } from 'boot/gettext'

import { useEnvConfigStore } from './envConfig.js'
import { useUiStore } from './ui.js'

import { tokenAuth, checkTokenApi } from 'config/app.conf'

export const useAuthStore = defineStore('auth', () => {
  const uiStore = useUiStore()

  const token = ref('')
  const isTokenChecked = ref(false)
  const user = ref({
    isPrivileged: false,
  })

  const userIsPrivileged = computed(() => user.value.isPrivileged)

  // These will be set by serverStore after initialization
  let _protocol = ''
  let _host = ''

  const setServerInfo = (protocol, host) => {
    _protocol = protocol
    _host = host
  }

  const getToken = async () => {
    const envConfigStore = useEnvConfigStore()
    const { data } = await api.get(`${envConfigStore.internalApi}/token`)
    if (data?.token) {
      setToken(data.token)
      return
    }

    try {
      const { data } = await api.post(
        `${_protocol}://${_host}${tokenAuth.url}`,
        {
          username: envConfigStore.user,
          password: envConfigStore.password,
        },
      )

      if (data?.token) {
        await api.post(`${envConfigStore.internalApi}/token`, {
          token: data.token,
        })
        setToken(data.token)
        return
      }
    } catch (error) {
      if (error?.response?.status === 400) {
        return { error: 'invalid_credentials' }
      }
    }

    setToken('')
  }

  const checkToken = async () => {
    try {
      await api.get(`${_protocol}://${_host}${checkTokenApi.url}`, {
        headers: { Authorization: token.value },
      })

      setTokenChecked(true)
      return { success: true }
    } catch (error) {
      if (!error.response) {
        return { error: 'no_connection' }
      }

      if (error.response.status === 403) {
        // Invalidate the token on the backend
        const envConfigStore = useEnvConfigStore()
        await api.post(`${envConfigStore.internalApi}/token`, { token: '' })
        setTokenChecked(false)
      }

      return { error: 'token_invalid' }
    }
  }

  const checkUser = async ({ username, password }) => {
    try {
      const envConfigStore = useEnvConfigStore()
      const { data } = await api.post(
        `${envConfigStore.internalApi}/user/check`,
        {
          username,
          password,
        },
      )

      if (data.is_privileged) {
        user.value.isPrivileged = true
      } else {
        uiStore.notifyError(gettext.$gettext('User without privileges'))
      }
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const setToken = (value) => {
    token.value = value ? `Token ${value}` : ''
  }

  const setTokenChecked = (value) => {
    isTokenChecked.value = value
  }

  return {
    token,
    isTokenChecked,
    user,
    userIsPrivileged,
    setServerInfo,
    getToken,
    checkToken,
    checkUser,
    setToken,
    setTokenChecked,
  }
})
