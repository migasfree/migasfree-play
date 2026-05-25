import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { api } from 'boot/axios'

import { useAuthStore } from './auth.js'
import { useServerStore } from './server.js'
import { useUiStore } from './ui.js'

import { tokenApiv4 } from 'config/app.conf'

export const useFiltersStore = defineStore('filters', () => {
  const categories = ref([])
  const selectedCategory = ref(null)
  const searchApp = ref(null)
  const onlyInstalledApps = ref(false)
  const searchDevice = ref(null)
  const onlyAssignedDevices = ref(false)

  const setCategories = async () => {
    const authStore = useAuthStore()
    const serverStore = useServerStore()
    const uiStore = useUiStore()

    const { token } = storeToRefs(authStore)
    const { initialUrl, serverVersion } = storeToRefs(serverStore)

    try {
      let data
      if (serverVersion.value.startsWith('4.')) {
        const base = `${initialUrl.value.token}`
        const url = `${base}${tokenApiv4.categories}`
        const response = await api.get(url, {
          headers: { Authorization: token.value },
        })
        data = response.data
      } else {
        data = await window.electronAPI.apps.getCategories()
      }

      categories.value = []

      const entries = serverVersion.value.startsWith('4.')
        ? Object.entries(data)
        : Object.entries(data)

      entries.forEach(([key, val]) => {
        const id = serverVersion.value.startsWith('4.') ? Number(key) : val.id
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
