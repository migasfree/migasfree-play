import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createGettext } from 'vue3-gettext'
import AppFilter from 'src/components/AppFilter.vue'
import { createTestingPinia } from '@pinia/testing'
import { useAppsStore } from 'src/stores/apps'
import { useFiltersStore } from 'src/stores/filters'

const gettext = createGettext({ defaultLanguage: 'en_US', translations: {} })

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
          gettext,
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              filters: {
                searchApp: '',
                selectedCategory: null,
                appStatusFilter: null,
                categories: [
                  { id: 1, name: 'Office' },
                  { id: 2, name: 'Games' },
                ],
              },
              apps: {
                presentStatuses: new Set(['installed', 'not_installed']),
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
              '<select :value="modelValue" @change="$emit(\'update:model-value\', $event.target.value)"><option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option></select>',
            props: ['modelValue', 'options', 'emitValue', 'mapOptions'],
            emits: ['update:model-value'],
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
    // Two q-select elements: category + status
    expect(wrapper.findAll('select').length).toBe(2)
  })

  it('updates searchApp filter', async () => {
    const input = wrapper.find('input')
    await input.setValue('firefox')

    expect(filtersStore.searchApp).toBe('firefox')
    expect(appsStore.filterApps).toHaveBeenCalled()
  })

  it('updates appStatusFilter via status select', async () => {
    const selects = wrapper.findAll('select')
    // Second select is the status filter
    const statusSelect = selects[1]
    await statusSelect.setValue('installed')

    expect(appsStore.filterApps).toHaveBeenCalled()
  })
})
