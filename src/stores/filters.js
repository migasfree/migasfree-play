import { defineStore } from 'pinia'

import { api } from 'boot/axios'

import { useAppStore } from './app'
import { useUiStore } from './ui'

import { tokenApi } from 'config/app.conf'

export const useFiltersStore = defineStore('filters', {
  state: () => ({
    categories: [],
    selectedCategory: null,
    searchApp: null,
    onlyInstalledApps: false,
    searchDevice: null,
    onlyAssignedDevices: false,
  }),
  getters: {
    getCategories: (state) => state.categories,
  },
  actions: {
    async setCategories() {
      const appStore = useAppStore()
      const uiStore = useUiStore()

      await api
        .get(`${appStore.initialUrl.token}${tokenApi.categories}`, {
          headers: { Authorization: appStore.token },
        })
        .then((response) => {
          Object.entries(response.data.results).map(([key, val]) => {
            this.categories.push({
              id: val.id,
              name: val.name,
            })
          })
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    },
  },
})
