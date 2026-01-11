import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BannerInfo from 'src/components/BannerInfo.vue'

describe('BannerInfo Component', () => {
  const globalConfig = {
    global: {
      stubs: {
        'q-banner': {
          template:
            '<div class="q-banner"><slot name="avatar" /><slot /></div>',
        },
        'q-icon': {
          template: '<i class="q-icon" :class="name" />',
          props: ['name'],
        },
      },
    },
  }

  it('should render message', () => {
    const wrapper = mount(BannerInfo, {
      props: {
        message: 'Test Message',
      },
      ...globalConfig,
    })

    expect(wrapper.text()).toContain('Test Message')
  })

  it('should render icon in avatar slot', () => {
    const wrapper = mount(BannerInfo, {
      props: {
        message: 'Test',
      },
      ...globalConfig,
    })

    expect(wrapper.find('.q-icon').exists()).toBe(true)
    expect(wrapper.find('.q-icon').attributes('class')).toContain(
      'mdi-information-outline',
    )
  })
})
