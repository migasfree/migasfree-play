import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import InfoItem from 'src/components/InfoItem.vue'

const QuasarStubs = {
  'q-item': {
    template: '<div class="q-item"><slot></slot></div>',
  },
  'q-item-section': {
    template: '<div class="q-item-section"><slot></slot></div>',
    props: ['avatar'],
  },
  'q-icon': {
    template: '<i class="q-icon" :data-name="name"></i>',
    props: ['name', 'color'],
  },
}

describe('InfoItem Component', () => {
  it('renders with required icon prop', () => {
    const wrapper = mount(InfoItem, {
      global: { stubs: QuasarStubs },
      props: { icon: 'mdi-home' },
    })

    expect(wrapper.find('.q-item').exists()).toBe(true)
    expect(wrapper.find('.q-icon').attributes('data-name')).toBe('mdi-home')
  })

  it('renders label prop', () => {
    const wrapper = mount(InfoItem, {
      global: { stubs: QuasarStubs },
      props: { icon: 'mdi-email', label: 'Email Address' },
    })

    expect(wrapper.text()).toContain('Email Address')
  })

  it('renders slot content instead of label', () => {
    const wrapper = mount(InfoItem, {
      global: { stubs: QuasarStubs },
      props: { icon: 'mdi-user' },
      slots: { default: '<strong>Custom Content</strong>' },
    })

    expect(wrapper.find('strong').exists()).toBe(true)
    expect(wrapper.find('strong').text()).toBe('Custom Content')
  })

  it('hides when show prop is false', () => {
    const wrapper = mount(InfoItem, {
      global: { stubs: QuasarStubs },
      props: { icon: 'mdi-hide', show: false },
    })

    expect(wrapper.find('.q-item').exists()).toBe(false)
  })

  it('shows by default when show prop is not specified', () => {
    const wrapper = mount(InfoItem, {
      global: { stubs: QuasarStubs },
      props: { icon: 'mdi-visible' },
    })

    expect(wrapper.find('.q-item').exists()).toBe(true)
  })
})
