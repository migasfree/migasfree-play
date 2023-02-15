import { defineStore } from 'pinia'

import { api } from 'boot/axios'

import { useAppStore } from './app'
import { useComputerStore } from './computer'
import { useUiStore } from './ui'

import { internalApi } from 'config/app.conf'

export const useTagsStore = defineStore('tags', {
  state: () => ({
    available: [],
    assigned: [],
  }),
  actions: {
    async getAvailableTags() {
      const computerStore = useComputerStore()
      const uiStore = useUiStore()
      const computer = computerStore.getComputer

      if (computer.cid)
        await api
          .get(`${internalApi}/tags/available`)
          .then((response) => {
            this.setAvailableTags(response.data)
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
    },

    async getAssignedTags() {
      const computerStore = useComputerStore()
      const uiStore = useUiStore()
      const computer = computerStore.getComputer

      if (computer.cid)
        await api
          .get(`${internalApi}/tags/assigned`)
          .then((response) => {
            this.setAssignedTags(response.data)
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
    },

    setAvailableTags(value) {
      this.available = value
    },

    setAssignedTags(value) {
      this.assigned = value
    },
  },
})
