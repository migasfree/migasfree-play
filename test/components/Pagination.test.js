import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Pagination from 'src/components/Pagination.vue'

// Mock app.conf.js
vi.mock('config/app.conf', () => ({
  resultsPerPage: 10,
}))

describe('Pagination Component', () => {
  const globalConfig = {
    global: {
      stubs: {
        'q-pagination': {
          template:
            '<div class="q-pagination" @click="$emit(\'update:model-value\', page)"><slot /></div>',
          props: ['modelValue', 'max'],
          emits: ['update:model-value'],
          data() {
            return { page: 2 }
          }, // Simulate clicking page 2
        },
      },
    },
  }

  it('should not render if total <= resultsPerPage', () => {
    const wrapper = mount(Pagination, {
      props: {
        total: 5,
        pageChanged: () => {},
      },
      ...globalConfig,
    })

    expect(wrapper.find('.q-pagination').exists()).toBe(false)
  })

  it('should render if total > resultsPerPage', () => {
    const wrapper = mount(Pagination, {
      props: {
        total: 15,
        pageChanged: () => {},
      },
      ...globalConfig,
    })

    expect(wrapper.find('.q-pagination').exists()).toBe(true)
  })

  it('should calculate pagesCount correctly', () => {
    const wrapper = mount(Pagination, {
      props: {
        total: 25, // 10 per page -> 3 pages
        pageChanged: () => {},
      },
      ...globalConfig,
    })

    // We can access component instance to check computed property if not exposed in template
    expect(wrapper.vm.pagesCount).toBe(3)
  })

  it('should call pageChanged when page updates', async () => {
    const pageChangedSpy = vi.fn()
    const wrapper = mount(Pagination, {
      props: {
        total: 25,
        pageChanged: pageChangedSpy,
      },
      ...globalConfig,
    })

    // Simulate q-pagination event
    await wrapper.find('.q-pagination').trigger('click')

    expect(pageChangedSpy).toHaveBeenCalledWith(2)
  })
})
