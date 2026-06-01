import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { useServerStore } from './server.js'
import { useUiStore } from './ui.js'
import { useComputerStore } from './computer.js'

export const usePackagesStore = defineStore('packages', () => {
  const uiStore = useUiStore()
  const serverStore = useServerStore()
  const computerStore = useComputerStore()

  const { clientVersion } = storeToRefs(serverStore)

  const available = ref([])
  const installed = ref([])
  const inventory = ref([])

  const API_METHODS = {
    '/packages/available/': window.electronAPI.packages.getAvailable,
    '/packages/installed/': window.electronAPI.packages.getInstalled,
    '/packages/inventory/': window.electronAPI.packages.getInventory,
  }

  const fetchPackages = async (endpoint, method = 'get', payload = null) => {
    try {
      const methodFn = API_METHODS[endpoint]
      if (!methodFn) throw new Error(`Unknown endpoint: ${endpoint}`)

      const data =
        method === 'post'
          ? await methodFn(payload, clientVersion.value)
          : await methodFn(clientVersion.value)

      return data || []
    } catch (error) {
      uiStore.notifyError(error)
      return []
    }
  }

  const setAvailablePackages = async () => {
    if (!computerStore.isRegistered) return
    available.value = await fetchPackages('/packages/available/')
  }

  const setInstalledPackages = async (appsPackagesList = []) => {
    if (!computerStore.isRegistered) return

    let list = appsPackagesList
    if (!list || list.length === 0) {
      const { useAppsStore } = await import('./apps.js')
      const appsStore = useAppsStore()
      list = appsStore.getAppsPackages || []
    }

    installed.value = await fetchPackages('/packages/installed/', 'post', list)
  }

  const setInventory = async () => {
    if (!computerStore.isRegistered) return
    inventory.value = await fetchPackages('/packages/inventory/')
  }

  const availableSet = computed(() => new Set(available.value))
  const installedSet = computed(() => new Set(installed.value))

  return {
    available,
    installed,
    inventory,
    availableSet,
    installedSet,
    setAvailablePackages,
    setInstalledPackages,
    setInventory,
  }
})
