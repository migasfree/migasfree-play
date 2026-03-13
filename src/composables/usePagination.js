import { ref, watch } from 'vue'
import { useUiStore } from 'src/stores/ui'
import { resultsPerPage } from 'config/app.conf'

/**
 * Composable for handling pagination with scroll-to-top behavior
 * @param {Ref} items - Reactive reference to the full list of items
 * @param {String} scrollTarget - CSS selector for the scroll target
 * @returns {Object} - { paginatedItems, pageChanged, currentPage }
 */
export function usePagination(items, scrollTarget = '#main') {
  const uiStore = useUiStore()
  const currentPage = ref(1)
  const paginatedItems = ref(items.value.slice(0, resultsPerPage))

  const pageChanged = (page = 1, shouldScroll = true) => {
    currentPage.value = page
    const start = (currentPage.value - 1) * resultsPerPage
    const end = start + resultsPerPage

    paginatedItems.value = items.value.slice(start, end)

    if (shouldScroll && scrollTarget) {
      // Use a slightly larger delay to avoid main-thread saturation
      // between the transition start and the render phase.
      setTimeout(() => {
        uiStore.scrollToElement(scrollTarget)
      }, 150)
    }
  }

  watch(items, () => {
    pageChanged(1, false)
  })

  return { paginatedItems, pageChanged, currentPage }
}
