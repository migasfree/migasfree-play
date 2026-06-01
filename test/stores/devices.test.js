import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDevicesStore } from 'src/stores/devices'

import { api } from 'boot/axios'

vi.mock('boot/axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

vi.mock('config/app.conf', () => ({
  tokenApi: {
    computer: '/computers/',
    availableDevices: '/devices/devices/available/?cid=',
    deviceData: '/devices/devices/',
    logicalDevice: '/devices/logical/',
  },
}))

vi.mock('src/stores/computer', async () => {
  const { ref, computed } = await import('vue')
  const cid = ref(123)
  const project = ref('migasfree')
  const isRegisteredComp = computed(
    () => !!cid.value && cid.value !== '0' && cid.value !== 0,
  )
  const store = {
    cid,
    project,
    get isRegistered() {
      return isRegisteredComp.value
    },
    computerId: vi.fn(),
    computerData: vi.fn(),
    computerNetwork: vi.fn(),
    computerLabel: vi.fn(),
    computerAttribute: vi.fn(),
    registerComputer: vi.fn(),
  }
  return {
    useComputerStore: () => store,
  }
})

vi.mock('src/stores/filters', async () => {
  const { ref } = await import('vue')
  const state = {
    searchDevice: ref(null),
    onlyAssignedDevices: ref(false),
  }
  return { useFiltersStore: () => state }
})

vi.mock('src/stores/auth', async () => {
  const { ref } = await import('vue')
  const state = {
    token: ref('Token xyz789'),
  }
  return { useAuthStore: () => state }
})

vi.mock('src/stores/server', async () => {
  const { ref } = await import('vue')
  const serverVersion = ref('5.0')
  const state = {
    initialUrl: ref({ token: 'https://api.example.com/api/v1/token' }),
    serverVersion,
    get isLegacyServer() {
      return serverVersion.value.startsWith('4.')
    },
  }
  return { useServerStore: () => state }
})

vi.mock('src/stores/ui', () => ({
  useUiStore: () => ({ notifyError: vi.fn() }),
}))

const mockDevicesResponse = {
  default_logical_device: 10,
  assigned_logical_devices_to_cid: [{ id: 1, device: { id: 100 } }],
  inflicted_logical_devices: [{ id: 2, device: { id: 200 } }],
}

const mockDeviceData = {
  id: 100,
  model: { name: 'HP LaserJet', manufacturer: { name: 'HP' } },
  data: { NAME: 'Printer 1' },
}

describe('Devices Store', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    window.electronAPI = {
      devices: {
        getAssigned: vi.fn(),
        getAvailable: vi.fn(),
        getLogical: vi.fn(),
        assign: vi.fn(),
        setDefault: vi.fn(),
      },
    }
    // Reset cid to 123 for each test
    const { useComputerStore } = await import('src/stores/computer')
    const computerStore = useComputerStore()
    computerStore.cid.value = 123
    // Reset filters
    const { useFiltersStore } = await import('src/stores/filters')
    const filtersStore = useFiltersStore()
    filtersStore.searchDevice.value = null
    filtersStore.onlyAssignedDevices.value = false
  })

  describe('Initial State', () => {
    it('has empty devices initially', () => {
      const store = useDevicesStore()
      expect(store.devices).toEqual([])
    })

    it('has empty filteredDevices initially', () => {
      const store = useDevicesStore()
      expect(store.filteredDevices).toEqual([])
    })
  })

  describe('computerDevices()', () => {
    it('returns early if no CID', async () => {
      const { useComputerStore } = await import('src/stores/computer')
      const computerStore = useComputerStore()
      computerStore.cid.value = 0

      const store = useDevicesStore()
      await store.computerDevices()

      expect(api.get).not.toHaveBeenCalled()
    })

    it('fetches assigned and inflicted devices', async () => {
      window.electronAPI.devices.getAssigned.mockResolvedValue(
        mockDevicesResponse,
      )
      window.electronAPI.devices.getAvailable.mockResolvedValue([
        mockDeviceData,
      ])

      const store = useDevicesStore()
      await store.computerDevices()

      expect(window.electronAPI.devices.getAssigned).toHaveBeenCalled()
    })
  })

  describe('getAvailableDevices()', () => {
    it('returns early if no CID', async () => {
      const { useComputerStore } = await import('src/stores/computer')
      const computerStore = useComputerStore()
      computerStore.cid.value = 0

      const store = useDevicesStore()
      await store.getAvailableDevices()

      expect(api.get).not.toHaveBeenCalled()
    })

    it('fetches available devices', async () => {
      const mockAvailable = [
        {
          id: 300,
          model: { name: 'Canon Scanner', manufacturer: { name: 'Canon' } },
          data: { NAME: 'Scanner' },
        },
      ]

      window.electronAPI.devices.getAvailable.mockResolvedValue(mockAvailable)

      const store = useDevicesStore()
      await store.getAvailableDevices()

      expect(window.electronAPI.devices.getAvailable).toHaveBeenCalled()
      expect(store.devices[0]['x-type']).toBe('available')
    })

    it('does not add duplicate devices if already present', async () => {
      const mockAvailable = [
        {
          id: 100, // Existing device
          model: { name: 'Existing Legacy', manufacturer: { name: 'HP' } },
          data: { NAME: 'Existing Legacy' },
        },
        {
          id: 200, // New device
          model: { name: 'New Scanner', manufacturer: { name: 'Canon' } },
          data: { NAME: 'New Scanner' },
        },
      ]

      window.electronAPI.devices.getAvailable.mockResolvedValue(mockAvailable)

      const store = useDevicesStore()
      // Simulate existing device
      store.devices = [
        {
          id: 100,
          'x-type': 'assigned',
          model: { name: 'Existing Legacy', manufacturer: { name: 'HP' } },
        },
      ]

      await store.getAvailableDevices()

      expect(window.electronAPI.devices.getAvailable).toHaveBeenCalled()
      // Should have 2 devices total (100 + 200), not 3
      expect(store.devices).toHaveLength(2)

      // Verify device 100 retains its original type
      const dev100 = store.devices.find((d) => d.id === 100)
      expect(dev100['x-type']).toBe('assigned')

      // Verify device 200 is added as available
      const dev200 = store.devices.find((d) => d.id === 200)
      expect(dev200['x-type']).toBe('available')
    })
  })

  describe('filterDevices()', () => {
    beforeEach(() => {
      const store = useDevicesStore()
      store.devices = [
        {
          id: 1,
          'x-type': 'assigned',
          model: { name: 'HP LaserJet', manufacturer: { name: 'HP' } },
          data: { NAME: 'Printer' },
        },
        {
          id: 2,
          'x-type': 'available',
          model: { name: 'Canon Scanner', manufacturer: { name: 'Canon' } },
          data: { NAME: 'Scanner' },
        },
        {
          id: 3,
          'x-type': 'available',
          model: { name: 'Epson Printer', manufacturer: { name: 'Epson' } },
          data: { NAME: 'Inkjet' },
        },
      ]
    })

    it('returns all devices when no filters', () => {
      const store = useDevicesStore()
      store.filterDevices()

      expect(store.filteredDevices).toHaveLength(3)
    })

    it('filters by search text (model name)', async () => {
      const { useFiltersStore } = await import('src/stores/filters')
      const filtersStore = useFiltersStore()
      filtersStore.searchDevice.value = 'laserjet'

      const store = useDevicesStore()
      store.filterDevices()

      expect(store.filteredDevices).toHaveLength(1)
      expect(store.filteredDevices[0].model.name).toBe('HP LaserJet')
    })

    it('filters by search text (manufacturer)', async () => {
      const { useFiltersStore } = await import('src/stores/filters')
      const filtersStore = useFiltersStore()
      filtersStore.searchDevice.value = 'canon'

      const store = useDevicesStore()
      store.filterDevices()

      expect(store.filteredDevices).toHaveLength(1)
      expect(store.filteredDevices[0].model.manufacturer.name).toBe('Canon')
    })

    it('filters by search text (data NAME)', async () => {
      const { useFiltersStore } = await import('src/stores/filters')
      const filtersStore = useFiltersStore()
      filtersStore.searchDevice.value = 'inkjet'

      const store = useDevicesStore()
      store.filterDevices()

      expect(store.filteredDevices).toHaveLength(1)
      expect(store.filteredDevices[0].data.NAME).toBe('Inkjet')
    })

    it('filters by assigned only', async () => {
      const { useFiltersStore } = await import('src/stores/filters')
      const filtersStore = useFiltersStore()
      filtersStore.onlyAssignedDevices.value = true

      const store = useDevicesStore()
      store.filterDevices()

      expect(store.filteredDevices).toHaveLength(1)
      expect(store.filteredDevices[0]['x-type']).toBe('assigned')
    })

    it('combines search and assigned filters', async () => {
      const { useFiltersStore } = await import('src/stores/filters')
      const filtersStore = useFiltersStore()
      filtersStore.searchDevice.value = 'hp'
      filtersStore.onlyAssignedDevices.value = true

      const store = useDevicesStore()
      store.filterDevices()

      expect(store.filteredDevices).toHaveLength(1)
      expect(store.filteredDevices[0].model.name).toBe('HP LaserJet')
    })
  })

  describe('addAssignedDevice() / removeAssignedDevice()', () => {
    beforeEach(() => {
      const store = useDevicesStore()
      store.devices = [
        {
          id: 1,
          logical: [
            { id: 10, 'x-type': 'available' },
            { id: 11, 'x-type': 'assigned' },
          ],
        },
      ]
    })

    it('addAssignedDevice updates logical device type to assigned', () => {
      const store = useDevicesStore()
      store.addAssignedDevice({ device: 1, id: 10 })

      const device = store.devices[0]
      const logical = device.logical.find((l) => l.id === 10)
      expect(logical['x-type']).toBe('assigned')
    })

    it('removeAssignedDevice updates logical device type to available', () => {
      const store = useDevicesStore()
      store.removeAssignedDevice({ device: 1, id: 11 })

      const device = store.devices[0]
      const logical = device.logical.find((l) => l.id === 11)
      expect(logical['x-type']).toBe('available')
    })

    it('handles non-existent device gracefully', () => {
      const store = useDevicesStore()
      // Should not throw
      store.addAssignedDevice({ device: 999, id: 10 })
      expect(store.devices[0].logical[0]['x-type']).toBe('available')
    })

    it('handles non-existent logical device gracefully', () => {
      const store = useDevicesStore()
      // Should not throw
      store.addAssignedDevice({ device: 1, id: 999 })
      expect(store.devices[0].logical[0]['x-type']).toBe('available')
    })
  })

  describe('getDeviceData()', () => {
    it('fetches device data successfully', async () => {
      const responseData = {
        id: 100,
        name: 'Test Device',
        data: { NAME: 'Device 1' },
      }
      window.electronAPI.devices.getAvailable.mockResolvedValue([responseData])

      const store = useDevicesStore()
      const result = await store.getDeviceData(100)

      expect(window.electronAPI.devices.getAvailable).toHaveBeenCalled()
      expect(result).toEqual(responseData)
    })

    it('parses data field as JSON for v4 server', async () => {
      // Change serverVersion to v4
      const { useServerStore } = await import('src/stores/server')
      const serverStore = useServerStore()
      serverStore.serverVersion.value = '4.20'

      const responseData = {
        id: 100,
        name: 'Test Device',
        data: '{"NAME": "Printer v4", "IP": "192.168.1.1"}',
      }
      api.get.mockResolvedValue({ data: responseData })

      const store = useDevicesStore()
      const result = await store.getDeviceData(100)

      // Should parse data string to object
      expect(result.data).toEqual({ NAME: 'Printer v4', IP: '192.168.1.1' })
      expect(typeof result.data).toBe('object')

      // Reset serverVersion
      serverStore.serverVersion.value = '5.0'
    })

    it('handles error and rethrows', async () => {
      const error = new Error('Network error')
      window.electronAPI.devices.getAvailable.mockRejectedValue(error)

      const store = useDevicesStore()
      await expect(store.getDeviceData(100)).rejects.toThrow('Network error')
    })
  })

  describe('getFeaturesDevices()', () => {
    it('fetches logical devices for all devices', async () => {
      window.electronAPI.devices.getLogical.mockResolvedValue([
        { id: 10, capability: { name: 'Print' } },
        { id: 11, capability: { name: 'Scan' } },
      ])

      const store = useDevicesStore()
      store.devices = [
        { id: 1, model: { name: 'Printer' } },
        { id: 2, model: { name: 'Scanner' } },
      ]

      await store.getFeaturesDevices()

      expect(window.electronAPI.devices.getLogical).toHaveBeenCalledTimes(2)
      expect(store.devices[0].logical).toBeDefined()
      expect(store.devices[1].logical).toBeDefined()
    })

    it('handles empty results', async () => {
      window.electronAPI.devices.getLogical.mockResolvedValue([])

      const store = useDevicesStore()
      store.devices = [{ id: 1, model: { name: 'Printer' } }]

      await store.getFeaturesDevices()

      expect(store.devices[0].logical).toBeUndefined()
    })
  })

  describe('getLogicalDevice()', () => {
    it('merges locally assigned and inflicted logical devices for v4 server fallback', async () => {
      const { useServerStore } = await import('src/stores/server')
      const serverStore = useServerStore()
      serverStore.serverVersion.value = '4.2'

      // Mock the HTTP API for computerDevices()
      api.get.mockResolvedValueOnce({
        data: {
          default_logical_device: 0,
          assigned_logical_devices_to_cid: [
            {
              id: 50,
              device: { id: 100, name: 'Printer' },
              feature: { id: 5, name: 'Color' },
              alternative_feature_name: 'Color Alternative',
            },
          ],
          inflicted_logical_devices: [
            {
              id: 60,
              device: { id: 100, name: 'Printer' },
              feature: { id: 6, name: 'Duplex' },
            },
          ],
        },
      })

      const store = useDevicesStore()
      await store.computerDevices()

      // Reset devices to have only device 100
      store.devices = [{ id: 100, model: { name: 'Printer' } }]

      // Mock the HTTP API to return an empty array for available logical devices
      api.get.mockResolvedValueOnce({ data: { results: [] } })

      await store.getFeaturesDevices()

      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining('/devices/logical/available/'),
        expect.any(Object),
      )

      // The logical array should be populated with the reconstructed merged capabilities
      expect(store.devices[0].logical).toHaveLength(2)

      const cap50 = store.devices[0].logical.find((l) => l.id === 50)
      expect(cap50).toBeDefined()
      expect(cap50.alternative_feature_name).toBe('Color Alternative')
      expect(cap50.alternative_capability_name).toBe('Color Alternative')
      expect(cap50.feature.name).toBe('Color')
      expect(cap50.capability.name).toBe('Color')

      const cap60 = store.devices[0].logical.find((l) => l.id === 60)
      expect(cap60).toBeDefined()
      expect(cap60.feature.name).toBe('Duplex')
      expect(cap60.capability.name).toBe('Duplex')

      // Reset serverVersion
      serverStore.serverVersion.value = '5.0'
    })
  })

  describe('setDefaultLogicalDevice()', () => {
    it('sets default logical device successfully via HTTP on v4', async () => {
      const { useServerStore } = await import('src/stores/server')
      const serverStore = useServerStore()
      serverStore.serverVersion.value = '4.2'

      api.patch.mockResolvedValue({
        data: { id: 123, default_logical_device: 10 },
      })

      const store = useDevicesStore()

      await store.setDefaultLogicalDevice(10)

      expect(api.patch).toHaveBeenCalledWith(
        expect.stringContaining('/computers/123/'),
        { default_logical_device: 10 },
        expect.any(Object),
      )
    })

    it('sets default logical device successfully via IPC on v5', async () => {
      const { useServerStore } = await import('src/stores/server')
      const serverStore = useServerStore()
      serverStore.serverVersion.value = '5.0'

      const store = useDevicesStore()

      await store.setDefaultLogicalDevice(10)

      expect(window.electronAPI.devices.setDefault).toHaveBeenCalledWith(10)
    })

    it('handles error gracefully', async () => {
      const { useServerStore } = await import('src/stores/server')
      const serverStore = useServerStore()
      serverStore.serverVersion.value = '5.0'

      window.electronAPI.devices.setDefault.mockRejectedValue(
        new Error('IPC error'),
      )

      const store = useDevicesStore()

      // Should not throw
      await store.setDefaultLogicalDevice(10)
    })
  })

  describe('changeDeviceAttributes()', () => {
    beforeEach(() => {
      const store = useDevicesStore()
      store.devices = [
        {
          id: 1,
          logical: [{ id: 10, attributes: [], device: { id: 1 } }],
        },
      ]
    })

    it('updates device attributes successfully via HTTP on v4', async () => {
      const { useServerStore } = await import('src/stores/server')
      const serverStore = useServerStore()
      serverStore.serverVersion.value = '4.2'

      api.patch.mockResolvedValue({
        data: {
          id: 10,
          attributes: [{ id: 1, value: 'test' }],
          device: { id: 1 },
        },
      })

      const store = useDevicesStore()
      const mockElement = { disabled: true }

      await store.changeDeviceAttributes({
        id: 10,
        attributes: [{ id: 1, value: 'test' }],
        element: mockElement,
      })

      expect(api.patch).toHaveBeenCalled()
      expect(mockElement.disabled).toBe(false)
    })

    it('updates device attributes successfully via IPC on v5', async () => {
      const { useServerStore } = await import('src/stores/server')
      const serverStore = useServerStore()
      serverStore.serverVersion.value = '5.0'

      const { useComputerStore } = await import('src/stores/computer')
      const computerStore = useComputerStore()
      computerStore.attribute = 'attr-123'

      const store = useDevicesStore()
      const mockElement = { disabled: true }

      await store.changeDeviceAttributes({
        id: 10,
        attributes: ['attr-123'],
        element: mockElement,
      })

      expect(window.electronAPI.devices.assign).toHaveBeenCalledWith(10, true)
      expect(mockElement.disabled).toBe(false)
    })

    it('handles error gracefully', async () => {
      const { useServerStore } = await import('src/stores/server')
      const serverStore = useServerStore()
      serverStore.serverVersion.value = '5.0'

      window.electronAPI.devices.assign.mockRejectedValue(
        new Error('IPC error'),
      )

      const store = useDevicesStore()

      // Should not throw
      await store.changeDeviceAttributes({
        id: 10,
        attributes: [],
      })
    })
  })
})
