import { ref, watch } from 'vue'
import { useUiStore } from 'src/stores/ui'
import { resultsPerPage } from 'config/app.conf'

/**
 * Composable for handling pagination with scroll-to-top behavior
 * @param {Ref} items - Reactive reference to the full list of items
 * @returns {Object} - { paginatedItems, pageChanged }
 */
export function usePagination(items) {
  const uiStore = useUiStore()
  const paginatedItems = ref(items.value.slice(0, resultsPerPage))

  const pageChanged = (currentPage = 1, shouldScroll = true) => {
    const start = (currentPage - 1) * resultsPerPage
    const end = start + resultsPerPage

    paginatedItems.value = items.value.slice(start, end)

    if (shouldScroll) {
      setTimeout(() => {
        const el = document.getElementById('main')
        if (el) uiStore.scrollToElement(el)
      }, 250)
    }
  }

  watch(items, () => {
    pageChanged(1, false)
  })

  return { paginatedItems, pageChanged }
}
