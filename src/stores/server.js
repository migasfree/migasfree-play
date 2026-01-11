import { ref } from 'vue'
import { defineStore } from 'pinia'
import { compareVersions } from 'compare-versions'

import { api } from 'boot/axios'
import { gettext } from 'boot/gettext'

import { useEnvConfigStore } from './envConfig.js'
import { useUiStore } from './ui.js'

import { publicApi, tokenApi, minimumClientVersion } from 'config/app.conf'

export const useServerStore = defineStore('server', () => {
  const uiStore = useUiStore()

  const protocol = ref('')
  const host = ref('')
  const initialUrl = ref({
    baseDomain: '',
    public: '',
    token: '',
  })
  const clientVersion = ref('0')
  const serverVersion = ref('0')
  const organization = ref('')
  const manageDevices = ref(true)

  const clientInfo = async () => {
    try {
      const envConfigStore = useEnvConfigStore()
      const { data } = await api.get(
        `${envConfigStore.internalApi}/preferences/client`,
      )
      clientVersion.value = data.version
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const checkClientVersion = () => {
    if (compareVersions(clientVersion.value, minimumClientVersion) < 0) {
      return {
        error: 'version_too_old',
        message: gettext.interpolate(
          gettext.$gettext(
            'This app requires at least Migasfree Client %{version}',
          ),
          {
            version: minimumClientVersion,
          },
        ),
      }
    }
    return { success: true }
  }

  const serverInfo = async () => {
    const url = `${initialUrl.value.public}${publicApi.serverInfo}`

    try {
      const { data } = await api.get(url)
      serverVersion.value = data.version
      organization.value = data.organization
    } catch (error) {
      if (error.response?.status === 405) {
        try {
          const { data } = await api.post(url)
          serverVersion.value = data.version
        } catch (postError) {
          uiStore.notifyError(postError)
        }
      } else {
        uiStore.notifyError(error)
      }
    }
  }

  const apiProtocol = async () => {
    try {
      const envConfigStore = useEnvConfigStore()
      const { data } = await api.get(
        `${envConfigStore.internalApi}/preferences/protocol/?version=${clientVersion.value}`,
      )
      protocol.value = data
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const clientManageDevices = async () => {
    try {
      const envConfigStore = useEnvConfigStore()
      const { data } = await api.get(
        `${envConfigStore.internalApi}/preferences/manage-devices/`,
      )
      manageDevices.value = data
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const serverHost = async () => {
    try {
      const envConfigStore = useEnvConfigStore()
      const { data } = await api.get(
        `${envConfigStore.internalApi}/preferences/server`,
      )
      host.value = data.server
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const setInitialUrl = () => {
    initialUrl.value.baseDomain = `${protocol.value}://${host.value}`
    initialUrl.value.public = `${initialUrl.value.baseDomain}${publicApi.prefix}`
    initialUrl.value.token = `${initialUrl.value.baseDomain}${tokenApi.prefix}`
  }

  return {
    protocol,
    host,
    initialUrl,
    clientVersion,
    serverVersion,
    organization,
    manageDevices,
    clientInfo,
    checkClientVersion,
    serverInfo,
    apiProtocol,
    clientManageDevices,
    serverHost,
    setInitialUrl,
  }
})
