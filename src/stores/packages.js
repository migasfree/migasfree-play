import { defineStore } from 'pinia'

import { api } from 'boot/axios'

import { useAppStore } from './app'
import { useUiStore } from './ui'

import { internalApi } from 'config/app.conf'

export const usePackagesStore = defineStore('packages', {
  state: () => ({
    available: [],
    installed: [],
  }),
  actions: {
    async setAvailablePackages() {
      const uiStore = useUiStore()

      await api
        .get(`${internalApi}/packages/available`)
        .then((response) => {
          this.available = response.data
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    },

    async setInstalledPackages() {
      const appStore = useAppStore()
      const uiStore = useUiStore()

      await api
        .post(`${internalApi}/packages/installed`, appStore.getAppsPackages)
        .then((response) => {
          this.installed = response.data
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    },
  },
})