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

  // Read token from storage only
  const readToken = async () => {
    const data = await window.electronAPI.token.read()
    return data?.token || null
  }

  // Request new token from server
  const requestToken = async () => {
    try {
      const config = await window.electronAPI.getEnvConfig()
      const data = await window.electronAPI.token.request(
        `${_protocol}://${_host}${tokenAuth.url}`,
        config.user,
        config.password,
      )
      return data?.token || null
    } catch (error) {
      console.error('requestToken error:', error)

      let status = error?.response?.status

      // Parse IPC error if present
      const match =
        error.message &&
        error.message.match(/Error invoking remote method.*?: (\{.*\})/)
      if (match) {
        try {
          const payload = JSON.parse(match[1])
          status = payload.status
        } catch (e) {
          console.error('Failed to parse IPC error payload', e)
        }
      }

      if (status === 400 || status === 401 || status === 403) {
        return { error: 'invalid_credentials' }
      }
      return { error: error.message || String(error) }
    }
  }

  // Save token to storage and set in memory
  const saveToken = async (tokenValue) => {
    await window.electronAPI.token.write({ token: tokenValue })
    setToken(tokenValue)
  }

  // Clear invalid token
  const clearToken = async () => {
    await window.electronAPI.token.write({ token: '' })
    setToken('')
    setTokenChecked(false)
  }

  // Legacy function for backward compatibility
  const getToken = async () => {
    const storedToken = await readToken()
    if (storedToken) {
      setToken(storedToken)
      return
    }

    const newToken = await requestToken()
    if (newToken && !newToken.error) {
      await saveToken(newToken)
      return
    }

    setToken('')
    return newToken // Return error if any
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
    readToken,
    requestToken,
    saveToken,
    clearToken,
    getToken,
    checkToken,
    checkUser,
    setToken,
    setTokenChecked,
  }
})
