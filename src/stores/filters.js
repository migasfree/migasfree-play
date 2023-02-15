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
    getSelectedCategory: (state) => state.selectedCategory,
    getSearchApp: (state) => state.searchApp,
    getOnlyInstalledApps: (state) => state.onlyInstalledApps,
    getSearchDevice: (state) => state.searchDevice,
    getOnlyAssignedDevices: (state) => state.onlyAssignedDevices,
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

    setSelectedCategory(value) {
      this.selectedCategory = value
    },

    setSearchApp(value) {
      this.searchApp = value
    },

    setOnlyInstalledApps(value) {
      this.onlyInstalledApps = value
    },

    setSearchDevice(value) {
      this.searchDevice = value
    },

    setOnlyAssignedDevices(value) {
      this.onlyAssignedDevices = value
    },
  },
})
