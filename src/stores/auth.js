import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import { api } from 'boot/axios'
import { gettext } from 'boot/gettext'

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
    const data = await window.electronAPI.token.read()
    if (data?.token) {
      setToken(data.token)
      return
    }

    try {
      const config = await window.electronAPI.getEnvConfig()
      const { data } = await api.post(
        `${_protocol}://${_host}${tokenAuth.url}`,
        {
          username: config.user,
          password: config.password,
        },
      )

      if (data?.token) {
        await window.electronAPI.token.write({
          token: data.token,
        })
        setToken(data.token)
        return
      }
    } catch (error) {
      console.error('getToken error:', error)
      if (error?.response?.status === 400) {
        return { error: 'invalid_credentials' }
      }
      return { error: error.message }
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

      const msg = error.message || ''
      if (error.response.status === 403 || msg.includes('token_invalid')) {
        // Invalidate the token on the backend
        await window.electronAPI.token.write({ token: '' })
        setTokenChecked(false)
        return { error: 'token_invalid' }
      }

      return { error: 'token_invalid' }
    }
  }

  const checkUser = async ({ username, password }) => {
    try {
      const data = await window.electronAPI.user.check(username, password)

      if (data.is_privileged) {
        user.value.isPrivileged = true
        uiStore.notifySuccess(gettext.$gettext('User with privileges'))
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
