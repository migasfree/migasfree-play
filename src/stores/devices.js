import { defineStore } from 'pinia'

import { api } from 'boot/axios'

import { tokenApi } from 'config/app.conf'

import { useAppStore } from './app'
import { useComputerStore } from './computer'
import { useFiltersStore } from './filters'
import { useUiStore } from './ui'

export const useDevicesStore = defineStore('devices', {
  state: () => ({
    assigned: [],
    inflicted: [],
    default: 0,
    available: [],
    filteredDevices: [],
  }),
  getters: {
    getAvailable: (state) => state.available,
  },
  actions: {
    async computerDevices() {
      const appStore = useAppStore()
      const computerStore = useComputerStore()
      const uiStore = useUiStore()
      const computer = computerStore.getComputer

      if (computer.cid)
        await api
          .get(
            `${appStore.initialUrl.token}${tokenApi.computer}${computer.cid}/devices/`,
            { headers: { Authorization: appStore.token } }
          )
          .then((response) => {
            this.default = response.data.default_logical_device
            this.assigned = response.data.assigned_logical_devices_to_cid
            this.inflicted = response.data.inflicted_logical_devices
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
    },

    async getAvailableDevices() {
      const appStore = useAppStore()
      const computerStore = useComputerStore()
      const uiStore = useUiStore()
      const computer = computerStore.getComputer

      if (computer.cid)
        await api
          .get(
            `${appStore.initialUrl.token}${tokenApi.availableDevices}${computer.cid}&page_size=${Number.MAX_SAFE_INTEGER}`,
            { headers: { Authorization: appStore.token } }
          )
          .then((response) => {
            this.available = response.data.results
            if (appStore.serverVersion.startsWith('4.')) {
              this.available.forEach((value) => {
                value.data = JSON.parse(value.data)
              })
            }
            this.filterDevices()
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
    },

    async getFeaturesDevices() {
      this.available.forEach((item, index) => {
        this.getLogicalDevice({ id: item.id, index })
      })
    },

    async getLogicalDevice({ id, index }) {
      const appStore = useAppStore()
      const computerStore = useComputerStore()
      const uiStore = useUiStore()
      const computer = computerStore.getComputer

      if (computer.cid)
        await api
          .get(
            `${appStore.initialUrl.token}${tokenApi.availableLogicalDevices}${computer.cid}&did=${id}`,
            { headers: { Authorization: appStore.token } }
          )
          .then((response) => {
            if (response.data.results) {
              let payload = {}
              payload.results = response.data.results
              payload.index = index
              this.addLogicalDevices(payload)
            }
          })
          .catch((error) => {
            uiStore.notifyError(error)
          })
    },

    changeDeviceAttributes({ id, attributes, element = null }) {
      const appStore = useAppStore()
      const uiStore = useUiStore()

      api
        .patch(
          `${appStore.initialUrl.token}${tokenApi.logicalDevice}${id}/`,
          { attributes },
          { headers: { Authorization: appStore.token } }
        )
        .then((response) => {
          if (response.data.id) {
            let payload = {}
            payload.results = response.data.attributes
            payload.index = id
            this.setLogicalAttributes(payload)
            if (element) element.disabled = false
          }
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    },

    filterDevices() {
      const filtersStore = useFiltersStore()

      let results = this.available

      if (filtersStore.searchDevice) {
        const pattern = filtersStore.searchDevice.toLowerCase()

        results = results.filter(
          (device) =>
            device.model.name.toLowerCase().includes(pattern) ||
            device.model.manufacturer.name.toLowerCase().includes(pattern) ||
            ('NAME' in device.data &&
              device.data.NAME.toLowerCase().includes(pattern))
        )
      }

      if (filtersStore.onlyAssignedDevices)
        results = results.filter((device) => {
          return (
            this.assigned.filter((x) => {
              return x.device.id === device.id
            }).length !== 0
          )
        })

      this.filteredDevices = results
    },

    addLogicalDevices(value) {
      this.available[value.index].logical = value.results
    },

    setLogicalAttributes(value) {
      for (let i = 0; i < this.available.length; i++) {
        for (let j = 0; j < this.available[i].logical.length; j++) {
          if (this.available[i].logical[j].id === value.index) {
            this.available[i].logical[j].attributes = value.results
            return
          }
        }
      }
    },

    addAssignedDevice(value) {
      this.assigned[this.assigned.length] = value
    },

    removeAssignedDevice(value) {
      for (let i = 0; i < this.assigned.length; i++) {
        if (this.assigned[i].id === value) {
          this.assigned.splice(i, 1)
          return
        }
      }
    },
  },
})
