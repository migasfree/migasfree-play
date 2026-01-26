import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { gettext } from 'boot/gettext'

import { useAppsStore } from './apps.js'
import { useAuthStore } from './auth.js'
import { useComputerStore } from './computer.js'
import { useDevicesStore } from './devices.js'
import { useEnvConfigStore } from './envConfig.js'
import { useExecutionsStore } from './executions.js'
import { useFiltersStore } from './filters.js'
import { usePackagesStore } from './packages.js'
import { usePreferencesStore } from './preferences.js'
import { useServerStore } from './server.js'
import { useTagsStore } from './tags.js'
import { useUiStore } from './ui.js'

export const useProgramStore = defineStore('program', () => {
  const uiStore = useUiStore()
  const authStore = useAuthStore()
  const serverStore = useServerStore()

  // Re-export refs from auth and server stores for backward compatibility
  const { token, isTokenChecked, userIsPrivileged } = storeToRefs(authStore)
  const {
    protocol,
    host,
    initialUrl,
    clientVersion,
    serverVersion,
    organization,
    manageDevices,
  } = storeToRefs(serverStore)

  // Own state
  const status = ref('')
  const stopApp = ref(false)

  const appIsStopped = computed(() => stopApp.value)

  const init = async () => {
    const appsStore = useAppsStore()
    const computerStore = useComputerStore()
    const devicesStore = useDevicesStore()
    const envConfigStore = useEnvConfigStore()
    const executionsStore = useExecutionsStore()
    const filtersStore = useFiltersStore()
    const packagesStore = usePackagesStore()
    const preferencesStore = usePreferencesStore()
    const tagsStore = useTagsStore()

    stopApp.value = false
    uiStore.loading()

    // Load environment config first
    await envConfigStore.load()

    setStatus(gettext.$gettext('Preferences'))
    await preferencesStore.readPreferences()
    if (appIsStopped.value) return

    // Get client info and check version
    await serverStore.clientInfo()
    const versionCheck = serverStore.checkClientVersion()
    if (versionCheck.error) {
      setStatus(versionCheck.message)
      setStopApp()
      return
    }

    // Get server connection info
    await serverStore.apiProtocol()
    await serverStore.clientManageDevices()
    await serverStore.serverHost()
    serverStore.setInitialUrl()

    // Pass server info to auth store
    authStore.setServerInfo(protocol.value, host.value)

    setStatus(gettext.$gettext('Server'))
    await Promise.all([
      serverStore.serverInfo(),
      (async () => {
        // Step 1: Read existing token from storage
        const storedToken = await authStore.readToken()

        if (storedToken) {
          authStore.setToken(storedToken)

          // Step 2: Validate existing token
          const checkResult = await authStore.checkToken()

          if (checkResult?.success) {
            // Token is valid, continue
            return
          }

          // Token is invalid, clear it
          await authStore.clearToken()
        }

        // Step 3: No valid token, request new one
        const newToken = await authStore.requestToken()

        if (newToken?.error === 'invalid_credentials') {
          setStatus(
            gettext.$gettext('Credentials are not valid. Review app settings.'),
          )
          setStopApp()
          return
        }

        if (newToken?.error) {
          setStatus(gettext.$gettext('There is no connection to the server'))
          setStopApp()
          return
        }

        if (!newToken) {
          setStatus(gettext.$gettext('Failed to obtain token'))
          setStopApp()
          return
        }

        // Step 4: Save and verify new token
        await authStore.saveToken(newToken)
        const verifyResult = await authStore.checkToken()

        if (!verifyResult?.success) {
          setStatus(gettext.$gettext('Token validation failed'))
          setStopApp()
        }
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
      setStatus(gettext.$gettext('Apps'))
      await appsStore.loadApps()

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
        if (preferencesStore.showApps) {
          appsStore.filterApps()
        }
      })(),
    )

    if (preferencesStore.showDevices) {
      optionalPromises.push(
        (async () => {
          setStatus(gettext.$gettext('Devices'))
          await devicesStore.computerDevices()
          await devicesStore.getAvailableDevices()
          await devicesStore.getFeaturesDevices()
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

  const setStatus = (value) => {
    status.value = value
  }

  const setStopApp = () => {
    stopApp.value = true
  }

  return {
    // Re-exported from authStore (backward compatibility)
    token,
    isTokenChecked,
    userIsPrivileged,
    checkUser: authStore.checkUser,

    // Re-exported from serverStore (backward compatibility)
    initialUrl,
    protocol,
    host,
    clientVersion,
    serverVersion,
    organization,
    manageDevices,

    // Own state and actions
    status,
    appIsStopped,
    init,
    setStatus,
    setStopApp,
  }
})
