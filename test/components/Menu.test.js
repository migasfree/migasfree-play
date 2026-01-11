import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Menu from 'src/components/Menu.vue'
import { createTestingPinia } from '@pinia/testing'
import { usePreferencesStore } from 'src/stores/preferences'

// Mock config
vi.mock('config/app.conf', () => ({
  urlHelp: 'http://help.url',
}))

// Mock vue3-gettext
vi.mock('vue3-gettext', () => ({
  createGettext: () => ({
    install: () => {},
  }),
  useGettext: () => ({
    $gettext: (key) => key,
  }),
}))

describe('Menu Component', () => {
  let wrapper
  let routerPush
  let preferencesStore

  beforeEach(() => {
    routerPush = vi.fn()

    wrapper = mount(Menu, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              preferences: {
                showApps: true,
                showDevices: true,
                showTags: false, // Hidden
                showDetails: true,
                showInfo: true,
                showPreferences: true,
                showHelp: true,
              },
            },
          }),
        ],
        mocks: {
          $router: { push: routerPush },
          $route: { name: 'apps' }, // Current route
          $gettext: (key) => key,
        },
        stubs: {
          'q-btn': {
            template:
              '<button @click="$attrs.onClick" :disabled="$attrs.disabled"><slot /></button>',
          },
          'q-tooltip': { template: '<span><slot /></span>' },
          'q-btn-dropdown': {
            template: '<div><slot name="label" /><slot /></div>',
          },
          'q-list': { template: '<ul><slot /></ul>' },
          'q-item': {
            template: '<li @click="$attrs.onClick"><slot /></li>',
          },
          'q-item-section': { template: '<span><slot /></span>' },
          'q-icon': true,
        },
      },
    })

    preferencesStore = usePreferencesStore()
  })

  it('renders visible menu items', () => {
    // Desktop view
    const buttons = wrapper.findAll('.gt-xs button')
    // Apps, Devices, Details, Info, Preferences, Help = 6 visible
    // Tags is hidden
    expect(buttons.length).toBe(6)
  })

  it('disables button for current route', () => {
    const appsBtn = wrapper.findAll('.gt-xs button')[0] // First is Apps
    expect(appsBtn.attributes('disabled')).toBeDefined()
  })

  it('navigates when button clicked', async () => {
    const devicesBtn = wrapper.findAll('.gt-xs button')[1] // Devices
    await devicesBtn.trigger('click')

    expect(routerPush).toHaveBeenCalledWith({ name: 'devices' })
  })

  it('handles external links correctly', () => {
    const helpBtn = wrapper.findAll('.gt-xs button')[5] // Help is last
    expect(helpBtn.attributes('type')).toBe('a')
    expect(helpBtn.attributes('target')).toBe('_blank')
    expect(helpBtn.attributes('href')).toBe('http://help.url')
  })

  it('reacts to preference changes', async () => {
    preferencesStore.showTags = true
    await wrapper.vm.$nextTick()

    const buttons = wrapper.findAll('.gt-xs button')
    expect(buttons.length).toBe(7) // Tags now visible
  })
})
