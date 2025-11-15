import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { api } from 'boot/axios'

import { useAppsStore } from './apps.js'
import { useProgramStore } from './program.js'
import { useUiStore } from './ui.js'

import { internalApi } from 'config/app.conf'

export const usePackagesStore = defineStore('packages', () => {
  const available = ref([])
  const installed = ref([])
  const inventory = ref([])

  const fetchPackages = async (endpoint, method = 'get', payload = null) => {
    const uiStore = useUiStore()
    const programStore = useProgramStore()
    const { clientVersion } = storeToRefs(programStore)

    try {
      const { data } = await (method === 'post'
        ? api.post(
            `${internalApi}${endpoint}?version=${clientVersion.value}`,
            payload,
          )
        : api.get(`${internalApi}${endpoint}?version=${clientVersion.value}`))
      return data
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const setAvailablePackages = async () => {
    available.value = await fetchPackages('/packages/available/')
  }

  const setInstalledPackages = async () => {
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
