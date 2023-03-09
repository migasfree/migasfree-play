import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { api } from 'boot/axios'

import { tokenApi } from 'config/app.conf'

import { useAppStore } from './app'
import { useComputerStore } from './computer'
import { useFiltersStore } from './filters'
import { useUiStore } from './ui'

export const useDevicesStore = defineStore('devices', () => {
  const assigned = ref([])
  const inflicted = ref([])
  const defaultDevice = ref(0)
  const available = ref([])
  const filteredDevices = ref([])

  async function computerDevices() {
    const appStore = useAppStore()
    const computerStore = useComputerStore()
    const uiStore = useUiStore()

    const { initialUrl, token } = storeToRefs(appStore)
    const { cid } = storeToRefs(computerStore)

    if (cid.value)
      await api
        .get(
          `${initialUrl.value.token}${tokenApi.computer}${cid.value}/devices/`,
          { headers: { Authorization: token.value } }
        )
        .then((response) => {
          defaultDevice.value = response.data.default_logical_device
          assigned.value = response.data.assigned_logical_devices_to_cid
          inflicted.value = response.data.inflicted_logical_devices
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
  }

  async function getAvailableDevices() {
    const appStore = useAppStore()
    const computerStore = useComputerStore()
    const uiStore = useUiStore()

    const { initialUrl, token, serverVersion } = storeToRefs(appStore)
    const { cid } = storeToRefs(computerStore)

    if (cid.value)
      await api
        .get(
          `${initialUrl.value.token}${tokenApi.availableDevices}${cid.value}&page_size=${Number.MAX_SAFE_INTEGER}`,
          { headers: { Authorization: token.value } }
        )
        .then((response) => {
          available.value = response.data.results
          if (serverVersion.value.startsWith('4.')) {
            available.value.forEach((value) => {
              value.data = JSON.parse(value.data)
            })
          }
          filterDevices()
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
  }

  async function getFeaturesDevices() {
    available.value.forEach((item, index) => {
      getLogicalDevice({ id: item.id, index })
    })
  }

  async function getLogicalDevice({ id, index }) {
    const appStore = useAppStore()
    const computerStore = useComputerStore()
    const uiStore = useUiStore()

    const { initialUrl, token } = storeToRefs(appStore)
    const { cid } = storeToRefs(computerStore)

    if (cid.value)
      await api
        .get(
          `${initialUrl.value.token}${tokenApi.availableLogicalDevices}${cid.value}&did=${id}`,
          { headers: { Authorization: token.value } }
        )
        .then((response) => {
          if (response.data.results) {
            let payload = {}
            payload.results = response.data.results
            payload.index = index
            addLogicalDevices(payload)
          }
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
  }

  function changeDeviceAttributes({ id, attributes, element = null }) {
    const appStore = useAppStore()
    const uiStore = useUiStore()

    const { initialUrl, token } = storeToRefs(appStore)

    api
      .patch(
        `${initialUrl.value.token}${tokenApi.logicalDevice}${id}/`,
        { attributes },
        { headers: { Authorization: token.value } }
      )
      .then((response) => {
        if (response.data.id) {
          let payload = {}
          payload.results = response.data.attributes
          payload.index = id
          setLogicalAttributes(payload)
          if (element) element.disabled = false
        }
      })
      .catch((error) => {
        uiStore.notifyError(error)
      })
  }

  function filterDevices() {
    const filtersStore = useFiltersStore()
    const { searchDevice, onlyAssignedDevices } = storeToRefs(filtersStore)

    let results = available.value

    if (searchDevice.value) {
      const pattern = searchDevice.value.toLowerCase()

      results = results.filter(
        (device) =>
          device.model.name.toLowerCase().includes(pattern) ||
          device.model.manufacturer.name.toLowerCase().includes(pattern) ||
          ('NAME' in device.data &&
            device.data.NAME.toLowerCase().includes(pattern))
      )
    }

    if (onlyAssignedDevices.value)
      results = results.filter((device) => {
        return (
          assigned.value.filter((x) => {
            return x.device.id === device.id
          }).length !== 0
        )
      })

    filteredDevices.value = results
  }

  function addLogicalDevices(value) {
    available.value[value.index].logical = value.results
  }

  function setLogicalAttributes(value) {
    for (let i = 0; i < available.value.length; i++) {
      for (let j = 0; j < available.value[i].logical.length; j++) {
        if (available.value[i].logical[j].id === value.index) {
          available.value[i].logical[j].attributes = value.results
          return
        }
      }
    }
  }

  function addAssignedDevice(value) {
    assigned.value[assigned.value.length] = value
  }

  function removeAssignedDevice(value) {
    for (let i = 0; i < assigned.value.length; i++) {
      if (assigned.value[i].id === value) {
        assigned.value.splice(i, 1)
        return
      }
    }
  }

  return {
    assigned,
    inflicted,
    defaultDevice,
    available,
    filteredDevices,
    computerDevices,
    getAvailableDevices,
    getFeaturesDevices,
    changeDeviceAttributes,
    filterDevices,
    addAssignedDevice,
    removeAssignedDevice,
  }
})
