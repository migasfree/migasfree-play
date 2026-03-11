import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BannerInfo from 'src/components/BannerInfo.vue'

describe('BannerInfo Component', () => {
  const globalConfig = {
    global: {
      stubs: {
        'q-icon': {
          template: '<i class="q-icon" :class="name" />',
          props: ['name'],
        },
        'q-btn': {
          template:
            '<button class="q-btn" @click="$emit(\'click\')"><slot /></button>',
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

  it('should render default info icon', () => {
    const wrapper = mount(BannerInfo, {
      props: {
        message: 'Test',
      },
      ...globalConfig,
    })

    expect(wrapper.find('.q-icon').exists()).toBe(true)
    expect(wrapper.find('.q-icon').attributes('class')).toContain(
      'mdi-information',
    )
  })

  it('should render specific type icon', () => {
    const wrapper = mount(BannerInfo, {
      props: {
        message: 'Test',
        type: 'critical',
      },
      ...globalConfig,
    })

    expect(wrapper.find('.q-icon').attributes('class')).toContain(
      'mdi-alert-circle-outline',
    )
  })

  it('should show close button when closable', () => {
    const wrapper = mount(BannerInfo, {
      props: {
        message: 'Test',
        closable: true,
      },
      ...globalConfig,
    })

    expect(wrapper.find('.q-btn').exists()).toBe(true)
  })

  it('should emit close event when close button is clicked', async () => {
    const wrapper = mount(BannerInfo, {
      props: {
        message: 'Test',
        closable: true,
      },
      ...globalConfig,
    })

    await wrapper.find('.q-btn').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('close')
  })
})
