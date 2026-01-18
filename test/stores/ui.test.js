import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUiStore } from 'src/stores/ui'

// Mock Quasar
vi.mock('quasar', () => ({
  scroll: {
    getScrollTarget: vi.fn(),
    setVerticalScrollPosition: vi.fn(),
  },
  Notify: {
    create: vi.fn(),
  },
}))

// Mock gettext
vi.mock('boot/gettext', () => ({
  gettext: {
    $gettext: (msg) => msg,
  },
}))

// Mock program store
vi.mock('src/stores/program', () => ({
  useProgramStore: () => ({
    setStatus: vi.fn(),
    setStopApp: vi.fn(),
  }),
}))

describe('UI Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('loading() sets isLoading to true', () => {
      const store = useUiStore()

      expect(store.isLoading).toBe(false)
      store.loading()
      expect(store.isLoading).toBe(true)
    })

    it('loadingFinished() sets isLoading to false', () => {
      const store = useUiStore()

      store.loading()
      expect(store.isLoading).toBe(true)
      store.loadingFinished()
      expect(store.isLoading).toBe(false)
    })
  })

  describe('Updating State', () => {
    it('updating() sets isUpdating to true', () => {
      const store = useUiStore()

      expect(store.isUpdating).toBe(false)
      store.updating()
      expect(store.isUpdating).toBe(true)
    })

    it('updatingFinished() sets isUpdating to false', () => {
      const store = useUiStore()

      store.updating()
      expect(store.isUpdating).toBe(true)
      store.updatingFinished()
      expect(store.isUpdating).toBe(false)
    })
  })

  describe('Notifications', () => {
    it('notifyError() shows error notification with string message', async () => {
      const { Notify } = await import('quasar')
      const store = useUiStore()

      store.notifyError('Test error message')

      expect(Notify.create).toHaveBeenCalledWith({
        color: 'negative',
        position: 'bottom',
        icon: 'mdi-alert-circle-outline',
        message: 'Test error message',
      })
    })

    it('notifyError() extracts message from error response', async () => {
      const { Notify } = await import('quasar')
      const store = useUiStore()

      const error = {
        response: {
          status: 404,
          data: 'Not found',
        },
      }

      store.notifyError(error)

      expect(Notify.create).toHaveBeenCalledWith({
        color: 'negative',
        position: 'bottom',
        icon: 'mdi-alert-circle-outline',
        message: 'Not found',
      })
    })

    it('notifyError() handles network errors', async () => {
      const { Notify } = await import('quasar')
      const store = useUiStore()

      const error = { code: 'ERR_NETWORK' }

      store.notifyError(error)

      expect(Notify.create).toHaveBeenCalledWith({
        color: 'negative',
        position: 'bottom',
        icon: 'mdi-alert-circle-outline',
        message: 'There is no connection to the server',
      })
    })

    it('notifyError() handles Axios errors without response as network errors', async () => {
      const { Notify } = await import('quasar')
      const store = useUiStore()

      // Axios error without response (network failure)
      const error = { isAxiosError: true }

      store.notifyError(error)

      expect(Notify.create).toHaveBeenCalledWith({
        color: 'negative',
        position: 'bottom',
        icon: 'mdi-alert-circle-outline',
        message: 'There is no connection to the server',
      })
    })

    it('notifyError() does NOT treat non-Axios errors as network errors', async () => {
      const { Notify } = await import('quasar')
      const store = useUiStore()

      // Non-Axios error (e.g., IPC error, file write error)
      const error = new Error('Failed to write executions file')

      store.notifyError(error)

      // Should show actual error message, not "no connection"
      expect(Notify.create).toHaveBeenCalledWith({
        color: 'negative',
        position: 'bottom',
        icon: 'mdi-alert-circle-outline',
        message: 'Failed to write executions file',
      })
    })

    it('notifyError() shows error.message for generic Error objects', async () => {
      const { Notify } = await import('quasar')
      const store = useUiStore()

      const error = new Error('An object could not be cloned')

      store.notifyError(error)

      expect(Notify.create).toHaveBeenCalledWith({
        color: 'negative',
        position: 'bottom',
        icon: 'mdi-alert-circle-outline',
        message: 'An object could not be cloned',
      })
    })

    it('notifyError() handles status code mapping', async () => {
      const { Notify } = await import('quasar')
      const store = useUiStore()

      const error = {
        response: {
          status: 401,
          data: {},
        },
      }

      store.notifyError(error)

      expect(Notify.create).toHaveBeenCalledWith({
        color: 'negative',
        position: 'bottom',
        icon: 'mdi-alert-circle-outline',
        message: 'UnAuthorized',
      })
    })

    it('notifySuccess() shows success notification', async () => {
      const { Notify } = await import('quasar')
      const store = useUiStore()

      store.notifySuccess('Operation completed')

      expect(Notify.create).toHaveBeenCalledWith({
        color: 'positive',
        position: 'bottom',
        icon: 'mdi-check-bold',
        message: 'Operation completed',
      })
    })

    it('notifyInfo() shows info notification', async () => {
      const { Notify } = await import('quasar')
      const store = useUiStore()

      store.notifyInfo('Information message')

      expect(Notify.create).toHaveBeenCalledWith({
        color: 'light-blue-3',
        position: 'bottom',
        textColor: 'black',
        icon: 'mdi-information-outline',
        message: 'Information message',
      })
    })
  })

  describe('Scroll', () => {
    it('scrollToElement() calls scroll functions', async () => {
      const { scroll } = await import('quasar')
      const store = useUiStore()
      const element = { offsetTop: 100 }

      store.scrollToElement(element)

      expect(scroll.getScrollTarget).toHaveBeenCalledWith(element)
      expect(scroll.setVerticalScrollPosition).toHaveBeenCalled()
    })
  })
})
