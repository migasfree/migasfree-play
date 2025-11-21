import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { compareVersions } from 'compare-versions'

import { api } from 'boot/axios'
import { gettext } from 'boot/gettext'

import { useAppsStore } from './apps.js'
import { useComputerStore } from './computer.js'
import { useDevicesStore } from './devices.js'
import { useExecutionsStore } from './executions.js'
import { useFiltersStore } from './filters.js'
import { usePackagesStore } from './packages.js'
import { usePreferencesStore } from './preferences.js'
import { useTagsStore } from './tags.js'
import { useUiStore } from './ui.js'

import {
  tokenAuth,
  publicApi,
  tokenApi,
  internalApi,
  checkTokenApi,
  minimumClientVersion,
} from 'config/app.conf'

export const useProgramStore = defineStore('program', () => {
  const uiStore = useUiStore()

  const protocol = ref('')
  const host = ref('')
  const initialUrl = ref({
    baseDomain: '',
    public: '',
    token: '',
  })
  const token = ref('')
  const isTokenChecked = ref(false)
  const clientVersion = ref('0')
  const serverVersion = ref('0')
  const organization = ref('')
  const manageDevices = ref(true)
  const user = ref({
    isPrivileged: false,
  })
  const status = ref('')
  const stopApp = ref(false)

  const userIsPrivileged = computed(() => user.value.isPrivileged)
  const appIsStopped = computed(() => stopApp.value)

  const init = async () => {
    const appsStore = useAppsStore()
    const computerStore = useComputerStore()
    const devicesStore = useDevicesStore()
    const executionsStore = useExecutionsStore()
    const filtersStore = useFiltersStore()
    const packagesStore = usePackagesStore()
    const preferencesStore = usePreferencesStore()
    const tagsStore = useTagsStore()

    stopApp.value = false
    uiStore.loading()

    setStatus(gettext.$gettext('Preferences'))
    await preferencesStore.readPreferences()
    if (appIsStopped.value) return
    await clientInfo()
    checkClientVersion()
    if (appIsStopped.value) return
    await apiProtocol()
    await clientManageDevices()
    await serverHost()

    setInitialUrl()

    setStatus(gettext.$gettext('Server'))
    await Promise.all([
      serverInfo(),
      (async () => {
        await getToken()
        await checkToken()
        if (!isTokenChecked.value) await getToken()
      })(),
    ])
    if (appIsStopped.value) return

    setStatus(gettext.$gettext('Computer'))
    await computerStore.computerInfo()
    await computerStore.computerId()
    await Promise.all([
      computerStore.computerNetwork(),
      (async () => {
        if (!serverVersion.value.startsWith('4.')) {
          await computerStore.computerLabel()
        }
      })(),
      computerStore.computerData(),
      computerStore.computerAttribute(),
    ])

    const optionalPromises = []

    optionalPromises.push(executionsStore.getExecutions())

    if (preferencesStore.showApps) {
      optionalPromises.push(
        (async () => {
          setStatus(gettext.$gettext('Apps'))
          await appsStore.loadApps()
        })(),
      )

      optionalPromises.push(
        (async () => {
          setStatus(gettext.$gettext('Categories'))
          await filtersStore.setCategories()
        })(),
      )
    }

    optionalPromises.push(
      (async () => {
        setStatus(gettext.$gettext('Packages'))
        await Promise.all([
          packagesStore.setAvailablePackages(),
          packagesStore.setInstalledPackages(),
          packagesStore.setInventory(),
        ])
      })(),
    )

    if (preferencesStore.showDevices) {
      optionalPromises.push(
        (async () => {
          setStatus(gettext.$gettext('Devices'))
          await Promise.all([
            devicesStore.computerDevices(),
            devicesStore.getAvailableDevices(),
            devicesStore.getFeaturesDevices(),
          ])
        })(),
      )
    }

    if (preferencesStore.showTags) {
      optionalPromises.push(
        (async () => {
          setStatus(gettext.$gettext('Tags'))
          await tagsStore.getTags()
        })(),
      )
    }

    await Promise.all(optionalPromises)

    setStatus('')
    uiStore.loadingFinished()
  }

  const clientInfo = async () => {
    try {
      const { data } = await api.get(`${internalApi}/preferences/client`)
      clientVersion.value = data.version
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const checkClientVersion = () => {
    if (compareVersions(clientVersion.value, minimumClientVersion) < 0) {
      setStatus(
        gettext.interpolate(
          gettext.$gettext(
            'This app requires at least Migasfree Client %{version}',
          ),
          {
            version: minimumClientVersion,
          },
        ),
      )
      setStopApp()
    }
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

  const getToken = async () => {
    const { data } = await api.get(`${internalApi}/token`)
    if (data?.token) {
      setToken(data.token)
      return
    }

    try {
      const { data } = await api.post(
        `${protocol.value}://${host.value}${tokenAuth.url}`,
        {
          username: process.env.MFP_USER ?? 'migasfree-play',
          password: process.env.MFP_PASSWORD ?? 'migasfree-play',
        },
      )

      if (data?.token) {
        await api.post(`${internalApi}/token`, { token: data.token })
        setToken(data.token)
        return
      }
    } catch (error) {
      if (error?.response?.status === 400) {
        setStatus(
          gettext.$gettext('Credentials are not valid. Review app settings.'),
        )
        setStopApp()
      }
    }

    setToken('')
  }

  const checkToken = async () => {
    try {
      await api.get(`${protocol.value}://${host.value}${checkTokenApi.url}`, {
        headers: { Authorization: token.value },
      })

      setTokenChecked(true)
    } catch (error) {
      if (!error.response) {
        setStatus(gettext.$gettext('There is no connection to the server'))
        setStopApp()
        return
      }

      if (error.response.status === 403) {
        // Invalidate the token on the backend
        await api.post(`${internalApi}/token`, { token: '' })
        setTokenChecked(false)
      }
    }
  }

  const checkUser = async ({ username, password }) => {
    try {
      const { data } = await api.post(`${internalApi}/user/check`, {
        username,
        password,
      })

      if (data.is_privileged) {
        user.value.isPrivileged = true
      } else {
        uiStore.notifyError(gettext.$gettext('User without privileges'))
      }
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const apiProtocol = async () => {
    try {
      const { data } = await api.get(
        `${internalApi}/preferences/protocol/?version=${clientVersion.value}`,
      )
      protocol.value = data
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const clientManageDevices = async () => {
    try {
      const { data } = await api.get(
        `${internalApi}/preferences/manage-devices/`,
      )
      manageDevices.value = data
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const serverHost = async () => {
    try {
      const { data } = await api.get(`${internalApi}/preferences/server`)
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

  const setToken = (value) => {
    token.value = `Token ${value}`
  }

  const setTokenChecked = (value) => {
    isTokenChecked.value = value
  }

  const setStatus = (value) => {
    status.value = value
  }

  const setStopApp = () => {
    stopApp.value = true
  }

  return {
    initialUrl,
    protocol,
    host,
    token,
    clientVersion,
    serverVersion,
    organization,
    manageDevices,
    status,
    userIsPrivileged,
    appIsStopped,
    init,
    checkUser,
    setStatus,
    setStopApp,
  }
})
