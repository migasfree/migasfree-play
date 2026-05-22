import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import { gettext } from 'boot/gettext'

import { useUiStore } from './ui.js'

export const useProgramStore = defineStore('program', () => {
  const uiStore = useUiStore()

  // Own state
  const status = ref('')
  const stopApp = ref(false)

  const appIsStopped = computed(() => stopApp.value)

  const init = async () => {
    // Lazy imports to avoid circular dependencies at module level
    const { useAppsStore } = await import('./apps.js')
    const { useAuthStore } = await import('./auth.js')
    const { useComputerStore } = await import('./computer.js')
    const { useDevicesStore } = await import('./devices.js')
    const { useEnvConfigStore } = await import('./envConfig.js')
    const { useExecutionsStore } = await import('./executions.js')
    const { useFiltersStore } = await import('./filters.js')
    const { usePackagesStore } = await import('./packages.js')
    const { usePreferencesStore } = await import('./preferences.js')
    const { useServerStore } = await import('./server.js')
    const { useTagsStore } = await import('./tags.js')

    const appsStore = useAppsStore()
    const authStore = useAuthStore()
    const computerStore = useComputerStore()
    const devicesStore = useDevicesStore()
    const envConfigStore = useEnvConfigStore()
    const executionsStore = useExecutionsStore()
    const filtersStore = useFiltersStore()
    const packagesStore = usePackagesStore()
    const preferencesStore = usePreferencesStore()
    const serverStore = useServerStore()
    const tagsStore = useTagsStore()

    stopApp.value = false
    uiStore.loading()

    // 1. Core initialization (Sequential)
    await envConfigStore.load()

    setStatus(gettext.$gettext('Preferences'))
    await preferencesStore.readPreferences()
    if (appIsStopped.value) return

    await serverStore.clientInfo()
    const versionCheck = serverStore.checkClientVersion()
    if (versionCheck.error) {
      setStatus(versionCheck.message)
      setStopApp()
      return
    }

    await serverStore.apiProtocol()
    await serverStore.clientManageDevices()
    await serverStore.serverHost()
    serverStore.setInitialUrl()

    // Authentication Setup
    authStore.setServerInfo(serverStore.protocol, serverStore.host)
    setStatus(gettext.$gettext('Server'))

    await Promise.all([
      serverStore.serverInfo(),
      (async () => {
        const storedToken = await authStore.readToken()
        if (storedToken) {
          authStore.setToken(storedToken)
          const checkResult = await authStore.checkToken()
          if (checkResult?.success) return
          await authStore.clearToken()
        }

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

        await authStore.saveToken(newToken)
        const verifyResult = await authStore.checkToken()
        if (!verifyResult?.success) {
          setStatus(gettext.$gettext('Token validation failed'))
          setStopApp()
        }
      })(),
    ])
    if (appIsStopped.value) return

    // Computer Identification
    setStatus(gettext.$gettext('Computer'))
    await computerStore.computerInfo()
    await computerStore.computerId()
    await Promise.all([
      computerStore.computerNetwork(),
      (async () => {
        if (!serverStore.isLegacyServer) {
          await computerStore.computerLabel()
        }
      })(),
      computerStore.computerData(),
      computerStore.computerAttribute(),
    ])

    // 2. Heavy Data loading (Parallel)
    const heavyPromises = []

    heavyPromises.push(executionsStore.getExecutions())

    if (computerStore.isRegistered) {
      heavyPromises.push(
        (async () => {
          if (preferencesStore.showApps) {
            setStatus(gettext.$gettext('Apps'))
            await appsStore.loadApps()
            await filtersStore.setCategories()
          }

          setStatus(gettext.$gettext('Packages'))
          await Promise.all([
            packagesStore.setAvailablePackages(),
            packagesStore.setInstalledPackages(appsStore.getAppsPackages),
            packagesStore.setInventory(),
          ])

          // Force Set pre-computation (Performance Fix)
          packagesStore.availableSet.size
          packagesStore.installedSet.size

          if (preferencesStore.showApps) {
            appsStore.filterApps()
          }
        })(),
      )

      if (preferencesStore.showDevices) {
        heavyPromises.push(
          (async () => {
            setStatus(gettext.$gettext('Devices'))
            await devicesStore.computerDevices()
            await devicesStore.getAvailableDevices()
            await devicesStore.getFeaturesDevices()
          })(),
        )
      }

      if (preferencesStore.showTags) {
        heavyPromises.push(
          (async () => {
            setStatus(gettext.$gettext('Tags'))
            await tagsStore.getTags()
          })(),
        )
      }
    }

    await Promise.all(heavyPromises)

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
    status,
    appIsStopped,
    init,
    setStatus,
    setStopApp,
  }
})
