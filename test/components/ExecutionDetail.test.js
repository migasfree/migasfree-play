import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import ExecutionDetail from 'src/components/ExecutionDetail.vue'

// Mock vue3-gettext with all required exports
vi.mock('vue3-gettext', () => ({
  useGettext: () => ({
    current: 'en_US',
    $gettext: (key) => key,
  }),
  createGettext: () => ({
    install: () => {},
  }),
}))

describe('ExecutionDetail Component', () => {
  let pinia

  beforeEach(() => {
    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        executions: {
          lastId: '123',
          isRunningCommand: false,
        },
      },
    })
  })

  const globalConfig = (options = {}) => ({
    global: {
      plugins: [pinia],
      mocks: {
        $gettext: (key) => key,
      },
      stubs: {
        'q-icon': {
          template: '<i class="q-icon" :class="name" />',
          props: ['name'],
        },
        'q-btn': {
          template: '<button class="q-btn"><slot /></button>',
        },
        'q-badge': {
          template: '<span class="q-badge"><slot /></span>',
        },
        'q-tooltip': { template: '<div class="q-tooltip"><slot /></div>' },
        'q-separator': true,
        'q-expansion-item': {
          template:
            '<div class="q-expansion-item"><slot name="header" /><slot /></div>',
        },
        'q-scroll-observer': true,
        'q-card': { template: '<div class="q-card"><slot /></div>' },
        'q-card-section': {
          template: '<div class="q-card-section"><slot /></div>',
        },
        'q-dialog': { template: '<div class="q-dialog"><slot /></div>' },
        DateView: { template: '<div class="date-view">Date</div>' },
        CopyButton: { template: '<button class="copy-button">Copy</button>' },
      },
      ...options.global,
    },
  })

  it('renders cancelled badge and icon when cancelled is true', () => {
    const wrapper = mount(ExecutionDetail, {
      props: {
        id: '123',
        command: 'ls',
        text: 'output',
        error: '',
        icon: 'mdi-play',
        cancelled: true,
      },
      ...globalConfig(),
    })

    // Assert Cancelled manually badge is present
    expect(wrapper.text()).toContain('Cancelled manually')

    // Assert warning icon in actions is present
    const warningIcon = wrapper.find('.q-icon.mdi-alert-outline')
    expect(warningIcon.exists()).toBe(true)
  })

  it('does not render cancelled badge and icon when cancelled is false', () => {
    const wrapper = mount(ExecutionDetail, {
      props: {
        id: '123',
        command: 'ls',
        text: 'output',
        error: '',
        icon: 'mdi-play',
        cancelled: false,
      },
      ...globalConfig(),
    })

    expect(wrapper.text()).not.toContain('Cancelled manually')
    const warningIcon = wrapper.find('.q-icon.mdi-alert-outline')
    expect(warningIcon.exists()).toBe(false)
  })
})
