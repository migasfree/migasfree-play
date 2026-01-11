import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DateView from 'src/components/DateView.vue'
import { date } from 'quasar'

// Mock vue3-gettext
vi.mock('vue3-gettext', () => ({
  useGettext: () => ({
    current: 'en_US',
    $gettext: (key) => key,
  }),
}))

describe('DateView Component', () => {
  const globalConfig = {
    global: {
      stubs: {
        'q-icon': {
          template: '<i class="q-icon" :class="name" />',
          props: ['name'],
        },
        'q-tooltip': { template: '<div class="q-tooltip"><slot /></div>' },
      },
    },
  }

  it('should render date formatted when value is provided', () => {
    const testDate = '2023-01-01T12:00:00.000Z'
    const wrapper = mount(DateView, {
      props: {
        value: testDate,
      },
      ...globalConfig,
    })

    // Check if date is formatted correctly
    // Note: Local time formatting depends on timezone, so this might be flaky if verifying exact string
    // Better to verify it contains part of the date or match format logic
    const formatted = date.formatDate(
      Date.parse(testDate),
      'YYYY-MM-DD HH:mm:ss',
    )
    expect(wrapper.text()).toContain(formatted)
  })

  it('should render icon if provided', () => {
    const wrapper = mount(DateView, {
      props: {
        value: '2023-01-01T12:00:00.000Z',
        icon: 'mdi-calendar',
      },
      ...globalConfig,
    })

    expect(wrapper.find('.q-icon').exists()).toBe(true)
    expect(wrapper.find('.q-icon').attributes('class')).toContain(
      'mdi-calendar',
    )
  })

  it('should render nothing if value is null', () => {
    const wrapper = mount(DateView, {
      props: {
        value: null,
      },
      ...globalConfig,
    })

    expect(wrapper.text()).toBe('')
    expect(wrapper.find('span.vertical-middle').exists()).toBe(false)
  })

  it('should render tooltip content', async () => {
    const testDate = '2023-01-01T12:00:00.000Z'
    const wrapper = mount(DateView, {
      props: {
        value: testDate,
        tooltipText: 'Created at',
      },
      ...globalConfig,
    })

    // We stub q-tooltip so we can check its content
    expect(wrapper.find('.q-tooltip').text()).toContain('Created at')
  })
})
