import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { api } from 'boot/axios'

import { useEnvConfigStore } from './envConfig.js'
import { useProgramStore } from './program.js'
import { useUiStore } from './ui.js'

export const usePackagesStore = defineStore('packages', () => {
  const available = ref([])
  const installed = ref([])
  const inventory = ref([])

  const fetchPackages = async (endpoint, method = 'get', payload = null) => {
    const envConfigStore = useEnvConfigStore()
    const uiStore = useUiStore()
    const programStore = useProgramStore()
    const { clientVersion } = storeToRefs(programStore)

    try {
      const { data } = await (method === 'post'
        ? api.post(
            `${envConfigStore.internalApi}${endpoint}?version=${clientVersion.value}`,
            payload,
          )
        : api.get(
            `${envConfigStore.internalApi}${endpoint}?version=${clientVersion.value}`,
          ))
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
