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
  const { ref } = await import('vue')
  const state = {
    cid: ref(123),
  }
  return { useComputerStore: () => state }
})

vi.mock('src/stores/filters', async () => {
  const { ref } = await import('vue')
  const state = {
    searchDevice: ref(null),
    onlyAssignedDevices: ref(false),
  }
  return { useFiltersStore: () => state }
})

vi.mock('src/stores/program', async () => {
  const { ref } = await import('vue')
  const state = {
    initialUrl: ref({ token: 'https://api.example.com/api/v1/token' }),
    token: ref('Token xyz789'),
    serverVersion: ref('5.0'),
  }
  return { useProgramStore: () => state }
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
      api.get.mockImplementation((url) => {
        if (url.includes('/devices/')) {
          return Promise.resolve({ data: mockDevicesResponse })
        }
        if (url.includes('/devices/devices/')) {
          return Promise.resolve({ data: mockDeviceData })
        }
        return Promise.resolve({ data: {} })
      })

      const store = useDevicesStore()
      await store.computerDevices()

      expect(api.get).toHaveBeenCalledWith(
        'https://api.example.com/api/v1/token/computers/123/devices/',
        { headers: { Authorization: 'Token xyz789' } },
      )
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
      const mockAvailable = {
        results: [
          {
            id: 300,
            model: { name: 'Canon Scanner', manufacturer: { name: 'Canon' } },
            data: { NAME: 'Scanner' },
          },
        ],
      }

      api.get.mockResolvedValue({ data: mockAvailable })

      const store = useDevicesStore()
      await store.getAvailableDevices()

      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining('/devices/devices/available/?cid=123'),
        { headers: { Authorization: 'Token xyz789' } },
      )
      expect(store.devices).toHaveLength(1)
      expect(store.devices[0]['x-type']).toBe('available')
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
  })
})
