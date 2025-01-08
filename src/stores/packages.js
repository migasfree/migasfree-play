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

  async function setAvailablePackages() {
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const { clientVersion } = storeToRefs(programStore)

    await api
      .get(`${internalApi}/packages/available/?version=${clientVersion.value}`)
      .then((response) => {
        available.value = response.data
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
  }

  async function setInstalledPackages() {
    const appsStore = useAppsStore()
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const { getAppsPackages } = storeToRefs(appsStore)
    const { clientVersion } = storeToRefs(programStore)

    await api
      .post(
        `${internalApi}/packages/installed/?version=${clientVersion.value}`,
        getAppsPackages.value,
      )
      .then((response) => {
        installed.value = response.data
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
  }

  async function setInventory() {
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const { clientVersion } = storeToRefs(programStore)

    await api
      .get(`${internalApi}/packages/inventory/?version=${clientVersion.value}`)
      .then((response) => {
        inventory.value = response.data
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
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
