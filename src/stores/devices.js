import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { api } from 'boot/axios'

import { tokenApi } from 'config/app.conf'

import { useComputerStore } from './computer.js'
import { useFiltersStore } from './filters.js'
import { useProgramStore } from './program.js'
import { useUiStore } from './ui.js'

export const useDevicesStore = defineStore('devices', () => {
  const devices = ref([])
  const defaultLogicalDevice = ref(0)
  const inflictedLogicalDevices = ref([])
  const assignedLogicalDevices = ref([])
  const filteredDevices = ref([])

  async function computerDevices() {
    const computerStore = useComputerStore()
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const { cid } = storeToRefs(computerStore)
    const { initialUrl, token } = storeToRefs(programStore)

    devices.value = []

    if (cid.value)
      try {
        const response = await api.get(
          `${initialUrl.value.token}${tokenApi.computer}${cid.value}/devices/`,
          { headers: { Authorization: token.value } },
        )

        defaultLogicalDevice.value = response.data.default_logical_device
        assignedLogicalDevices.value =
          response.data.assigned_logical_devices_to_cid
        inflictedLogicalDevices.value = response.data.inflicted_logical_devices

        for (const item of assignedLogicalDevices.value) {
          try {
            const deviceData = await getDeviceData(item.device.id)
            deviceData['x-type'] = 'assigned'
            devices.value.push(deviceData)
          } catch (error) {
            uiStore.notifyError(error)
          }
        }

        for (const item of inflictedLogicalDevices.value) {
          try {
            let deviceData = await getDeviceData(item.device.id)
            deviceData['x-type'] = 'inflicted'
            devices.value.push(deviceData)
          } catch (error) {
            uiStore.notifyError(error)
          }
        }
      } catch (error) {
        uiStore.notifyError(error)
      }
  }

  // today is forbidden use this method
  async function setDefaultLogicalDevice(logicalId) {
    const computerStore = useComputerStore()
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const { cid } = storeToRefs(computerStore)
    const { initialUrl, token } = storeToRefs(programStore)

    if (cid.value) {
      await api
        .patch(
          `${initialUrl.value.token}${tokenApi.computer}${cid.value}/devices/`,
          { default_logical_device: logicalId },
          { headers: { Authorization: token.value } },
        )
        .then(() => {
          /* TODO */
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
    }
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
          const result = response.data.results
          if (serverVersion.value.startsWith('4.')) {
            result.forEach((value) => {
              value.data = JSON.parse(value.data)
            })
          }

          result.forEach((item) => {
            item['x-type'] = 'available'
            if (!devices.value.some((element) => element.id === item.id))
              devices.value.push(item)
          })
          filterDevices()
        })
        .catch((error) => {
          uiStore.notifyError(error)
        })
  }

  async function getDeviceData(id) {
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const { initialUrl, token, serverVersion } = storeToRefs(programStore)

    try {
      const response = await api.get(
        `${initialUrl.value.token}${tokenApi.deviceData}${id}/`,
        {
          headers: { Authorization: token.value },
        },
      )
      if (serverVersion.value.startsWith('4.')) {
        response.data.forEach((value) => {
          value.data = JSON.parse(value.data)
        })
      }
      return response.data
    } catch (error) {
      uiStore.notifyError(error)
      throw error
    }
  }

  async function getFeaturesDevices() {
    devices.value.forEach((item, index) => {
      getLogicalDevice({ id: item.id, index })
    })
  }

  async function getLogicalDevice({ id, index }) {
    const programStore = useProgramStore()
    const uiStore = useUiStore()

    const { initialUrl, token } = storeToRefs(programStore)

    await api
      .get(
        `${initialUrl.value.token}${tokenApi.logicalDevice}?device__id=${id}`,
        {
          headers: { Authorization: token.value },
        },
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
          updateLogicalDeviceProperty(
            response.data.device.id,
            id,
            'attributes',
            response.data.attributes,
          )
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

    let results = devices.value

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
      results = results.filter((item) => {
        return item['x-type'] === 'assigned'
      })

    filteredDevices.value = results
  }

  function addLogicalDevices(value) {
    value.results.forEach((item) => {
      if (
        inflictedLogicalDevices.value.find((element) => element.id === item.id)
      ) {
        item['x-type'] = 'inflicted'
      } else if (
        assignedLogicalDevices.value.find((element) => element.id === item.id)
      ) {
        item['x-type'] = 'assigned'
      } else {
        item['x-type'] = 'available'
      }

      item['x-is-default'] = defaultLogicalDevice.value === item.id
    })
    value.results.sort((a, b) =>
      a.capability.name.localeCompare(b.capability.name),
    )
    devices.value[value.index].logical = value.results
  }

  function updateLogicalDeviceProperty(deviceId, logicalId, property, value) {
    const indexDevice = devices.value.findIndex((item) => item.id === deviceId)
    const indexLogical = devices.value[indexDevice].logical.findIndex(
      (item) => item.id === logicalId,
    )

    devices.value[indexDevice].logical[indexLogical][property] = value
  }

  function addAssignedDevice(value) {
    updateLogicalDeviceProperty(value.device, value.id, 'x-type', 'assigned')
  }

  function removeAssignedDevice(value) {
    updateLogicalDeviceProperty(value.device, value.id, 'x-type', 'available')
  }

  return {
    devices,
    filteredDevices,
    computerDevices,
    setDefaultLogicalDevice,
    getAvailableDevices,
    getDeviceData,
    getFeaturesDevices,
    changeDeviceAttributes,
    filterDevices,
    addAssignedDevice,
    removeAssignedDevice,
  }
})
