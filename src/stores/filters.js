import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { api } from 'boot/axios'

import { useAppStore } from './app'
import { useUiStore } from './ui'

import { tokenApi, tokenApiv4 } from 'config/app.conf'

export const useFiltersStore = defineStore('filters', () => {
  const categories = ref([])
  const selectedCategory = ref(null)
  const searchApp = ref(null)
  const onlyInstalledApps = ref(false)
  const searchDevice = ref(null)
  const onlyAssignedDevices = ref(false)

  async function setCategories() {
    const appStore = useAppStore()
    const uiStore = useUiStore()

    const { initialUrl, token, serverVersion } = storeToRefs(appStore)

    let url = `${initialUrl.value.token}${tokenApi.categories}`
    if (serverVersion.value.startsWith('4.'))
      url = `${initialUrl.value.token}${tokenApiv4.categories}`

    await api
      .get(url, {
        headers: { Authorization: token.value },
      })
      .then((response) => {
        if (serverVersion.value.startsWith('4.')) {
          Object.entries(response.data).map(([key, val]) => {
            categories.value.push({
              id: key,
              name: val,
            })
          })
        } else {
          Object.entries(response.data.results).map(([key, val]) => {
            categories.value.push({
              id: val.id,
              name: val.name,
            })
          })
        }
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
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
