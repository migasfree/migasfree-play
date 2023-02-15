import { defineStore } from 'pinia'

import { api } from 'boot/axios'

import { useAppStore } from './app'
import { useUiStore } from './ui'

import { internalApi, tokenApi } from 'config/app.conf'

export const useComputerStore = defineStore('computer', {
  state: () => ({
    name: '',
    uuid: '',
    cid: 0,
    project: '',
    user: '',
    link: '',
    mask: '',
    network: '',
    helpdesk: '',
    data: {},
    attribute: 0,
  }),
  getters: {
    getComputer: (state) => state,
    getLink: (state) => state.link,
  },
  actions: {
    async computerInfo() {
      const uiStore = useUiStore()

      await api
        .get(`${internalApi}/preferences/server`)
        .then((response) => {
          this.setComputerInfo(response.data)
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    },

    async computerNetwork() {
      const uiStore = useUiStore()

      await api
        .get(`${internalApi}/computer/network`)
        .then((response) => {
          this.setComputerNetwork(response.data)
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    },

    async computerId() {
      const appStore = useAppStore()
      const uiStore = useUiStore()

      await api
        .get(`${internalApi}/computer/id`)
        .then((response) => {
          this.setComputerId(response.data)
          this.setComputerLink({
            protocol: appStore.protocol,
            host: appStore.host,
            cid: response.data,
          })
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    },

    async computerData() {
      const appStore = useAppStore()
      const uiStore = useUiStore()

      if (this.cid)
        await api
          .get(`${appStore.initialUrl.token}${tokenApi.computer}${this.cid}/`, {
            headers: { Authorization: appStore.token },
          })
          .then((response) => {
            this.setComputerData(response.data)
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
    },

    async computerAttribute() {
      const appStore = useAppStore()
      const uiStore = useUiStore()

      if (this.cid)
        await api
          .get(
            `${appStore.initialUrl.token}${tokenApi.cidAttribute}${this.cid}`,
            { headers: { Authorization: appStore.token } }
          )
          .then((response) => {
            if (response.data.count === 1)
              this.setComputerAttribute(response.data.results[0].id)
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
    },

    setComputerInfo(value) {
      this.uuid = value.uuid
      this.name = value.computer_name
      this.user = value.user
      this.project = value.project
    },

    setComputerId(value) {
      this.cid = value
    },

    setComputerLink(value) {
      this.link = `${value.protocol}://${value.host}/computers/results/${value.cid}/`
    },

    setComputerData(value) {
      this.data = value
    },

    setComputerAttribute(value) {
      this.attribute = value
    },

    setComputerNetwork(value) {
      this.mask = value.mask
      this.network = value.network
    },
  },
})
