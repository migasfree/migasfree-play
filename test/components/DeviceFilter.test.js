import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DeviceFilter from 'src/components/DeviceFilter.vue'
import { createTestingPinia } from '@pinia/testing'
import { useDevicesStore } from 'src/stores/devices'
import { useFiltersStore } from 'src/stores/filters'

// Mocks
vi.mock('components/FilterCard.vue', () => ({
  default: {
    template: '<div><slot /></div>',
  },
}))

describe('DeviceFilter Component', () => {
  let wrapper
  let devicesStore
  let filtersStore

  beforeEach(() => {
    wrapper = mount(DeviceFilter, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              filters: {
                searchDevice: '',
                onlyAssignedDevices: false,
              },
            },
          }),
        ],
        mocks: {
          $gettext: (key) => key,
        },
        stubs: {
          'q-input': {
            template:
              '<input :value="modelValue" @input="$emit(\'update:model-value\', $event.target.value)" />',
            props: ['modelValue'],
          },
          'q-toggle': {
            template:
              '<input type="checkbox" :checked="modelValue" @change="$emit(\'update:model-value\', $event.target.checked)" />',
            props: ['modelValue', 'label'],
          },
          'q-icon': true,
        },
      },
    })

    devicesStore = useDevicesStore()
    filtersStore = useFiltersStore()
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('updates searchDevice filter', async () => {
    const input = wrapper.find('input:not([type="checkbox"])')
    await input.setValue('printer')

    expect(filtersStore.searchDevice).toBe('printer')
    expect(devicesStore.filterDevices).toHaveBeenCalled()
  })

  it('updates onlyAssignedDevices filter', async () => {
    const toggle = wrapper.find('input[type="checkbox"]')
    await toggle.setChecked(true)

    expect(filtersStore.onlyAssignedDevices).toBe(true)
    expect(devicesStore.filterDevices).toHaveBeenCalled()
  })
})
