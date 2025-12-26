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

  const pageChanged = (currentPage = 1) => {
    const start = (currentPage - 1) * resultsPerPage
    const end = start + resultsPerPage

    paginatedItems.value = items.value.slice(start, end)

    setTimeout(() => {
      uiStore.scrollToElement(document.getElementById('main'))
    }, 250)
  }

  watch(items, () => {
    pageChanged()
  })

  return { paginatedItems, pageChanged }
}
