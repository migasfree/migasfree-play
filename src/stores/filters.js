import { defineStore } from 'pinia'

import { api } from 'boot/axios'

import { useAppStore } from './app'
import { useUiStore } from './ui'

import { tokenApi, tokenApiv4 } from 'config/app.conf'

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

      let url = `${appStore.initialUrl.token}${tokenApi.categories}`
      if (appStore.serverVersion.startsWith('4.'))
        url = `${appStore.initialUrl.token}${tokenApiv4.categories}`

      await api
        .get(url, {
          headers: { Authorization: appStore.token },
        })
        .then((response) => {
          if (appStore.serverVersion.startsWith('4.')) {
            Object.entries(response.data).map(([key, val]) => {
              this.categories.push({
                id: key,
                name: val,
              })
            })
          } else {
            Object.entries(response.data.results).map(([key, val]) => {
              this.categories.push({
                id: val.id,
                name: val.name,
              })
            })
          }
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    },
  },
})
