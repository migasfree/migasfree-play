import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { api } from 'boot/axios'

import { tokenApi } from 'config/app.conf'

import { useAuthStore } from './auth.js'
import { useComputerStore } from './computer.js'
import { useFiltersStore } from './filters.js'
import { useServerStore } from './server.js'
import { useUiStore } from './ui.js'

export const useDevicesStore = defineStore('devices', () => {
  const uiStore = useUiStore()
  const authStore = useAuthStore()
  const computerStore = useComputerStore()
  const filtersStore = useFiltersStore()
  const serverStore = useServerStore()

  const { cid } = storeToRefs(computerStore)
  const { token } = storeToRefs(authStore)
  const { initialUrl, serverVersion } = storeToRefs(serverStore)
  const { searchDevice, onlyAssignedDevices } = storeToRefs(filtersStore)

  const devices = ref([])
  const defaultLogicalDevice = ref(0)
  const inflictedLogicalDevices = ref([])
  const assignedLogicalDevices = ref([])
  const filteredDevices = ref([])
  const hasLoaded = ref(false)

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

    if (!computerStore.isRegistered) return

    try {
      let data
      if (serverVersion.value.startsWith('4.')) {
        const response = await tokenRequest(
          'get',
          `${initialUrl.value.token}${tokenApi.computer}${cid.value}/devices/`,
        )
        data = response.data
      } else {
        data = await window.electronAPI.devices.getAssigned()
      }

      // Safe normalization for v4 and v5 structures
      if (data && Array.isArray(data.logical)) {
        // v5 server structure (via CLI or Safe API)
        const logicalList = []
        try {
          const available = await window.electronAPI.devices.getAvailable()
          for (const outer of data.logical) {
            if (outer && typeof outer === 'object') {
              const keys = Object.keys(outer)
              if (keys.length > 0) {
                const inner = outer[keys[0]]
                if (inner && typeof inner === 'object') {
                  const physDev = Array.isArray(available)
                    ? available.find((d) => d.name === inner.name)
                    : null
                  const physId = physDev ? physDev.id : 0
                  logicalList.push({
                    id: inner.id,
                    device: {
                      id: physId,
                      name: inner.name,
                    },
                  })
                }
              }
            }
          }
        } catch {
          // Fail-safe fallback if getAvailable fails or is not ready yet
        }
        defaultLogicalDevice.value =
          data.default !== undefined ? data.default : 0
        assignedLogicalDevices.value = logicalList
        inflictedLogicalDevices.value = []
      } else {
        // v4 server structure or legacy/mock structure
        defaultLogicalDevice.value = data?.default_logical_device || 0
        assignedLogicalDevices.value =
          data?.assigned_logical_devices_to_cid || []
        inflictedLogicalDevices.value = data?.inflicted_logical_devices || []
      }

      // Process sequentially to avoid race conditions with duplicate checks
      for (const item of assignedLogicalDevices.value) {
        if (item.device && item.device.id) {
          await addDeviceIfMissing(item, 'assigned')
        }
      }
      for (const item of inflictedLogicalDevices.value) {
        if (item.device && item.device.id) {
          await addDeviceIfMissing(item, 'inflicted')
        }
      }
      hasLoaded.value = true
    } catch (err) {
      uiStore.notifyError(err)
    }
  }

  // today is forbidden use this method
  const setDefaultLogicalDevice = async (logicalId) => {
    if (!computerStore.isRegistered) return

    try {
      if (serverVersion.value.startsWith('4.')) {
        await tokenRequest(
          'patch',
          `${initialUrl.value.token}${tokenApi.computer}${cid.value}/devices/`,
          { default_logical_device: logicalId },
        )
      } else {
        await window.electronAPI.devices.setDefault(logicalId)
      }
      defaultLogicalDevice.value = logicalId
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const getAvailableDevices = async () => {
    if (!computerStore.isRegistered) return

    try {
      let results
      if (serverVersion.value.startsWith('4.')) {
        const response = await tokenRequest(
          'get',
          `${initialUrl.value.token}${tokenApi.availableDevices}${cid.value}&page_size=${Number.MAX_SAFE_INTEGER}`,
        )
        results = response.data.results
      } else {
        results = await window.electronAPI.devices.getAvailable()
      }

      if (serverVersion.value.startsWith('4.')) {
        results = results.map((item) => ({
          ...item,
          data: JSON.parse(item.data),
        }))
        // Deduplicate results for v4 servers compatibility (buggy servers may return duplicates)
        const seen = new Set()
        results = results.filter((item) => {
          if (seen.has(item.id)) return false
          seen.add(item.id)
          return true
        })
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
      let itemData
      if (serverVersion.value.startsWith('4.')) {
        const response = await tokenRequest(
          'get',
          `${initialUrl.value.token}${tokenApi.deviceData}${id}/`,
        )
        itemData = response.data
      } else {
        const allAvailable = await window.electronAPI.devices.getAvailable()
        itemData = allAvailable.find((d) => d.id === id)
        if (!itemData) throw new Error('Device not found')
      }

      const data = serverVersion.value.startsWith('4.')
        ? { ...itemData, data: JSON.parse(itemData.data) }
        : itemData

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
      let results

      if (serverVersion.value.startsWith('4.')) {
        const url = `${initialUrl.value.token}${tokenApi.logicalDevice}available/?cid=${cid.value}&did=${id}`
        const { data } = await tokenRequest('get', url)
        if (!data?.results?.length) return
        results = data.results
      } else {
        results = await window.electronAPI.devices.getLogical(id)
        if (!results?.length) return
      }

      // Deduplicate logical devices for v4 servers compatibility
      if (serverVersion.value.startsWith('4.')) {
        const seen = new Set()
        results = results.filter((item) => {
          if (seen.has(item.id)) return false
          seen.add(item.id)
          return true
        })
      }

      addLogicalDevices({
        results,
        index,
      })
    } catch (error) {
      uiStore.notifyError(error)
    }
  }

  const changeDeviceAttributes = async ({ id, attributes, element = null }) => {
    try {
      if (serverVersion.value.startsWith('4.')) {
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
      } else {
        const isAssigning = attributes.includes(computerStore.attribute)
        await window.electronAPI.devices.assign(id, isAssigning)
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

  const getCapabilityName = (item) =>
    serverVersion.value.startsWith('4.')
      ? item.feature?.name || ''
      : item.capability?.name || ''

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
      getCapabilityName(a).localeCompare(getCapabilityName(b)),
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
    hasLoaded,
  }
})
