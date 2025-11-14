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

  const setAvailablePackages = async () => {
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const { clientVersion } = storeToRefs(programStore)

    try {
      const { data } = await api.get(
        `${internalApi}/packages/available/?version=${clientVersion.value}`,
      )
      available.value = data
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const setInstalledPackages = async () => {
    const appsStore = useAppsStore()
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const { getAppsPackages } = storeToRefs(appsStore)
    const { clientVersion } = storeToRefs(programStore)

    try {
      const { data } = await api.post(
        `${internalApi}/packages/installed/?version=${clientVersion.value}`,
        getAppsPackages.value,
      )
      installed.value = data
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const setInventory = async () => {
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const { clientVersion } = storeToRefs(programStore)

    try {
      const { data } = await api.get(
        `${internalApi}/packages/inventory/?version=${clientVersion.value}`,
      )
      inventory.value = data
    } catch (error) {
      uiStore.notifyError(error)
    }
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
