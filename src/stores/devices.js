import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { api } from 'boot/axios'

import { tokenApi } from 'config/app.conf'

import { useComputerStore } from './computer.js'
import { useFiltersStore } from './filters.js'
import { useProgramStore } from './program.js'
import { useUiStore } from './ui.js'

export const useDevicesStore = defineStore('devices', () => {
  const uiStore = useUiStore()
  const computerStore = useComputerStore()
  const programStore = useProgramStore()
  const filtersStore = useFiltersStore()

  const { cid } = storeToRefs(computerStore)
  const { initialUrl, token, serverVersion } = storeToRefs(programStore)
  const { searchDevice, onlyAssignedDevices } = storeToRefs(filtersStore)

  const devices = ref([])
  const defaultLogicalDevice = ref(0)
  const inflictedLogicalDevices = ref([])
  const assignedLogicalDevices = ref([])
  const filteredDevices = ref([])

  const tokenRequest = async (method, url, payload = null) => {
    const config = { headers: { Authorization: token.value } }
    const request = api[method]

    return payload ? request(url, payload, config) : request(url, config)
  }

  const addDeviceIfMissing = async (item, type) => {
    if (!devices.value.some((d) => d.id === item.device.id)) {
      try {
        const data = await getDeviceData(item.device.id)
        data['x-type'] = type
        devices.value.push(data)
      } catch (err) {
        uiStore.notifyError(err)
      }
    }
  }

  const computerDevices = async () => {
    devices.value = []

    if (!cid.value) return

    try {
      const { data } = await tokenRequest(
        'get',
        `${initialUrl.value.token}${tokenApi.computer}${cid.value}/devices/`,
      )

      defaultLogicalDevice.value = data.default_logical_device
      assignedLogicalDevices.value = data.assigned_logical_devices_to_cid
      inflictedLogicalDevices.value = data.inflicted_logical_devices

      await Promise.all([
        ...assignedLogicalDevices.value.map((item) =>
          addDeviceIfMissing(item, 'assigned'),
        ),
        ...inflictedLogicalDevices.value.map((item) =>
          addDeviceIfMissing(item, 'inflicted'),
        ),
      ])
    } catch (err) {
      uiStore.notifyError(err)
    }
  }

  // today is forbidden use this method
  const setDefaultLogicalDevice = async (logicalId) => {
    if (!cid.value) return

    try {
      await tokenRequest(
        'patch',
        `${initialUrl.value.token}${tokenApi.computer}${cid.value}/devices/`,
        { default_logical_device: logicalId },
      )
      // TODO: handle successful update
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const getAvailableDevices = async () => {
    if (!cid.value) return

    try {
      const response = await tokenRequest(
        'get',
        `${initialUrl.value.token}${tokenApi.availableDevices}${cid.value}&page_size=${Number.MAX_SAFE_INTEGER}`,
      )

      let results = response.data.results

      if (serverVersion.value.startsWith('4.')) {
        results = results.map((item) => ({
          ...item,
          data: JSON.parse(item.data),
        }))
      }

      results.forEach((item) => {
        item['x-type'] = 'available'
        if (!devices.value.some((d) => d.id === item.id)) {
          devices.value.push(item)
        }
      })

      filterDevices()
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const getDeviceData = async (id) => {
    try {
      const response = await tokenRequest(
        'get',
        `${initialUrl.value.token}${tokenApi.deviceData}${id}/`,
      )

      const data = serverVersion.value.startsWith('4.')
        ? response.data.map((v) => ({ ...v, data: JSON.parse(v.data) }))
        : response.data

      return data
    } catch (error) {
      uiStore.notifyError(error)
      throw error
    }
  }

  const getFeaturesDevices = async () => {
    await Promise.all(
      devices.value.map((item, index) =>
        getLogicalDevice({ id: item.id, index }),
      ),
    )
  }

  const getLogicalDevice = async ({ id, index }) => {
    try {
      const { data } = await tokenRequest(
        'get',
        `${initialUrl.value.token}${tokenApi.logicalDevice}?device__id=${id}`,
      )

      if (!data?.results?.length) return

      addLogicalDevices({
        results: data.results,
        index,
      })
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const changeDeviceAttributes = async ({ id, attributes, element = null }) => {
    try {
      const { data } = await tokenRequest(
        'patch',
        `${initialUrl.value.token}${tokenApi.logicalDevice}${id}/`,
        { attributes },
      )

      if (data.id) {
        updateLogicalDeviceProperty(
          data.device.id,
          id,
          'attributes',
          data.attributes,
        )
        if (element) element.disabled = false
      }
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const filterDevices = () => {
    const pattern = searchDevice.value?.toLowerCase()
    const needSearch = !!pattern
    const needAssigned = onlyAssignedDevices.value

    filteredDevices.value = devices.value.filter((device) => {
      if (needAssigned && device['x-type'] !== 'assigned') return false

      if (needSearch) {
        const modelName = device.model?.name?.toLowerCase()
        const manufacturerName = device.model?.manufacturer?.name?.toLowerCase()
        const dataName = device.data?.NAME?.toLowerCase()

        return (
          (modelName && modelName.includes(pattern)) ||
          (manufacturerName && manufacturerName.includes(pattern)) ||
          (dataName && dataName.includes(pattern))
        )
      }

      return true
    })
  }

  const addLogicalDevices = (value) => {
    const inflictedIds = new Set(inflictedLogicalDevices.value.map((d) => d.id))
    const assignedIds = new Set(assignedLogicalDevices.value.map((d) => d.id))
    const defaultId = defaultLogicalDevice.value

    value.results.forEach((item) => {
      if (inflictedIds.has(item.id)) {
        item['x-type'] = 'inflicted'
      } else if (assignedIds.has(item.id)) {
        item['x-type'] = 'assigned'
      } else {
        item['x-type'] = 'available'
      }

      item['x-is-default'] = defaultId === item.id
    })

    value.results.sort((a, b) =>
      a.capability.name.localeCompare(b.capability.name),
    )

    devices.value[value.index].logical = value.results
  }

  const updateLogicalDeviceProperty = (
    deviceId,
    logicalId,
    property,
    value,
  ) => {
    const device = devices.value.find((d) => d.id === deviceId)
    if (!device) return

    const logical = device.logical.find((l) => l.id === logicalId)
    if (!logical) return

    logical[property] = value
  }

  const addAssignedDevice = (value) => {
    updateLogicalDeviceProperty(value.device, value.id, 'x-type', 'assigned')
  }

  const removeAssignedDevice = (value) => {
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
