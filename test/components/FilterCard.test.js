import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FilterCard from 'src/components/FilterCard.vue'

// Minimal Quasar stub for q-card components
const QuasarStubs = {
  'q-card': {
    template: '<div class="q-card"><slot></slot></div>',
  },
  'q-card-section': {
    template: '<div class="q-card-section"><slot></slot></div>',
  },
  'q-card-actions': {
    template: '<div class="q-card-actions"><slot></slot></div>',
  },
}

describe('FilterCard Component', () => {
  it('renders default slot content', () => {
    const wrapper = mount(FilterCard, {
      global: { stubs: QuasarStubs },
      slots: { default: '<p class="test-content">Filter content</p>' },
    })

    expect(wrapper.find('.test-content').exists()).toBe(true)
    expect(wrapper.find('.test-content').text()).toBe('Filter content')
  })

  it('renders actions slot when provided', () => {
    const wrapper = mount(FilterCard, {
      global: { stubs: QuasarStubs },
      slots: {
        default: '<p>Content</p>',
        actions: '<button class="test-action">Apply</button>',
      },
    })

    expect(wrapper.find('.test-action').exists()).toBe(true)
    expect(wrapper.find('.test-action').text()).toBe('Apply')
  })

  it('does not render actions section when slot is empty', () => {
    const wrapper = mount(FilterCard, {
      global: { stubs: QuasarStubs },
      slots: { default: '<p>Content only</p>' },
    })

    expect(wrapper.find('.q-card-actions').exists()).toBe(false)
  })

  it('applies correct layout classes', () => {
    const wrapper = mount(FilterCard, {
      global: { stubs: QuasarStubs },
      slots: { default: '<p>Test</p>' },
    })

    expect(wrapper.find('.row').exists()).toBe(true)
    expect(wrapper.find('.col').exists()).toBe(true)
  })
})
