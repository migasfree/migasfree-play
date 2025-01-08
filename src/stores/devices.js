import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { api } from 'boot/axios'

import { tokenApi } from 'config/app.conf'

import { useComputerStore } from './computer.js'
import { useFiltersStore } from './filters.js'
import { useProgramStore } from './program.js'
import { useUiStore } from './ui.js'

export const useDevicesStore = defineStore('devices', () => {
  const assigned = ref([])
  const inflicted = ref([])
  const defaultDevice = ref(0)
  const available = ref([])
  const filteredDevices = ref([])

  async function computerDevices() {
    const computerStore = useComputerStore()
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const { cid } = storeToRefs(computerStore)
    const { initialUrl, token } = storeToRefs(programStore)

    if (cid.value)
      await api
        .get(
          `${initialUrl.value.token}${tokenApi.computer}${cid.value}/devices/`,
          { headers: { Authorization: token.value } },
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
    const computerStore = useComputerStore()
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const { cid } = storeToRefs(computerStore)
    const { initialUrl, token, serverVersion } = storeToRefs(programStore)

    if (cid.value)
      await api
        .get(
          `${initialUrl.value.token}${tokenApi.availableDevices}${cid.value}&page_size=${Number.MAX_SAFE_INTEGER}`,
          { headers: { Authorization: token.value } },
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
    const computerStore = useComputerStore()
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const { cid } = storeToRefs(computerStore)
    const { initialUrl, token } = storeToRefs(programStore)

    if (cid.value)
      await api
        .get(
          `${initialUrl.value.token}${tokenApi.availableLogicalDevices}${cid.value}&did=${id}`,
          { headers: { Authorization: token.value } },
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
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const { initialUrl, token } = storeToRefs(programStore)

    api
      .patch(
        `${initialUrl.value.token}${tokenApi.logicalDevice}${id}/`,
        { attributes },
        { headers: { Authorization: token.value } },
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
            device.data.NAME.toLowerCase().includes(pattern)),
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
