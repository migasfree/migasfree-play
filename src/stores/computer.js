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
          this.uuid = response.data.uuid
          this.name = response.data.computer_name
          this.user = response.data.user
          this.project = response.data.project
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
          this.mask = response.data.mask
          this.network = response.data.network
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    },

    async computerId() {
      const appStore = useAppStore()
      const uiStore = useUiStore()

      if (appStore.clientVersion.startsWith('4.')) {
        await api
          .get(
            `${appStore.protocol}://${appStore.host}/get_computer_info/?uuid=${this.uuid}`
          )
          .then((response) => {
            this.cid = response.data.id
            this.setComputerLink()
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
      } else {
        await api
          .get(`${internalApi}/computer/id`)
          .then((response) => {
            this.cid = response.data
            this.setComputerLink()
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
      }
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
            this.data = response.data
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
              this.attribute = response.data.results[0].id
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
    },

    setComputerLink() {
      const appStore = useAppStore()

      if (appStore.serverVersion.startsWith('4.'))
        this.link = `${appStore.protocol}://${appStore.host}/admin/server/computer/${this.cid}/change/`
      else
        this.link = `${appStore.protocol}://${appStore.host}/computers/results/${this.cid}/`
    },
  },
})
