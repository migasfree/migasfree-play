import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { api } from 'boot/axios'

import { useProgramStore } from './program.js'
import { useUiStore } from './ui.js'

import { tokenApi, tokenApiv4 } from 'config/app.conf'

export const useFiltersStore = defineStore('filters', () => {
  const categories = ref([])
  const selectedCategory = ref(null)
  const searchApp = ref(null)
  const onlyInstalledApps = ref(false)
  const searchDevice = ref(null)
  const onlyAssignedDevices = ref(false)

  const setCategories = async () => {
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const { initialUrl, token, serverVersion } = storeToRefs(programStore)

    const base = `${initialUrl.value.token}`
    const url = serverVersion.value.startsWith('4.')
      ? `${base}${tokenApiv4.categories}`
      : `${base}${tokenApi.categories}`

    try {
      const { data } = await api.get(url, {
        headers: { Authorization: token.value },
      })

      categories.value = []

      const entries = serverVersion.value.startsWith('4.')
        ? Object.entries(data)
        : Object.entries(data.results)

      entries.forEach(([, val]) => {
        const id = serverVersion.value.startsWith('4.') ? val : val.id
        const name = serverVersion.value.startsWith('4.') ? val : val.name

        categories.value.push({ id, name })
      })
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  return {
    categories,
    selectedCategory,
    searchApp,
    onlyInstalledApps,
    searchDevice,
    onlyAssignedDevices,
    setCategories,
  }
})
