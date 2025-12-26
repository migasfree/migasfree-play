import { storeToRefs } from 'pinia'
import { useUiStore } from 'src/stores/ui'

/**
 * Composable for handling page sync operations with loading state
 * @param {Function} syncFn - Async function to execute during sync
 * @returns {Object} - { isUpdating, sync }
 */
export function usePageSync(syncFn) {
  const uiStore = useUiStore()
  const { isUpdating } = storeToRefs(uiStore)

  const sync = async () => {
    uiStore.updating()
    try {
      await syncFn()
    } finally {
      uiStore.updatingFinished()
    }
  }

  return { isUpdating, sync }
}
