import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { useProgramStore } from './program.js'
import { useUiStore } from './ui.js'

export const usePackagesStore = defineStore('packages', () => {
  const available = ref([])
  const installed = ref([])
  const inventory = ref([])

  const fetchPackages = async (endpoint, method = 'get', payload = null) => {
    const uiStore = useUiStore()
    const programStore = useProgramStore()
    const { clientVersion } = storeToRefs(programStore)

    try {
      const methods = {
        '/packages/available/': window.electronAPI.packages.getAvailable,
        '/packages/installed/': window.electronAPI.packages.getInstalled,
        '/packages/inventory/': window.electronAPI.packages.getInventory,
      }

      const methodFn = methods[endpoint]
      const data =
        method === 'post'
          ? await methodFn(payload, clientVersion.value)
          : await methodFn(clientVersion.value)

      return data
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const setAvailablePackages = async () => {
    available.value = await fetchPackages('/packages/available/')
  }

  const setInstalledPackages = async () => {
    // Lazy import to avoid circular dependency with apps.js
    const { useAppsStore } = await import('./apps.js')
    const appsStore = useAppsStore()

    const { getAppsPackages } = storeToRefs(appsStore)

    installed.value = await fetchPackages(
      '/packages/installed/',
      'post',
      getAppsPackages.value,
    )
  }

  const setInventory = async () => {
    inventory.value = await fetchPackages('/packages/inventory/')
  }

  return {
    available,
    installed,
    inventory,
    setAvailablePackages,
    setInstalledPackages,
    setInventory,
  }
})
