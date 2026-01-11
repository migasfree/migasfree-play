import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AppFilter from 'src/components/AppFilter.vue'
import { createTestingPinia } from '@pinia/testing'
import { useAppsStore } from 'src/stores/apps'
import { useFiltersStore } from 'src/stores/filters'

// Mocks
vi.mock('components/FilterCard.vue', () => ({
  default: {
    template: '<div><slot /></div>',
  },
}))

describe('AppFilter Component', () => {
  let wrapper
  let appsStore
  let filtersStore

  beforeEach(() => {
    wrapper = mount(AppFilter, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              filters: {
                searchApp: '',
                selectedCategory: null,
                onlyInstalledApps: false,
                categories: [
                  { id: 1, name: 'Office' },
                  { id: 2, name: 'Games' },
                ],
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
          'q-select': {
            template:
              '<select :value="modelValue" @change="$emit(\'update:model-value\', $event.target.value)"><option v-for="opt in options" :key="opt.id" :value="opt">{{ opt.name }}</option></select>',
            props: ['modelValue', 'options'],
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

    appsStore = useAppsStore()
    filtersStore = useFiltersStore()
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
  })

  it('updates searchApp filter', async () => {
    const input = wrapper.find('input:not([type="checkbox"])')
    await input.setValue('firefox')

    expect(filtersStore.searchApp).toBe('firefox')
    expect(appsStore.filterApps).toHaveBeenCalled()
  })

  it('updates onlyInstalledApps filter', async () => {
    const toggle = wrapper.find('input[type="checkbox"]')
    await toggle.setChecked(true)

    expect(filtersStore.onlyInstalledApps).toBe(true)
    expect(appsStore.filterApps).toHaveBeenCalled()
  })
})
