/**
 * Vitest setup file - Global mocks and configuration
 */

import { vi } from 'vitest'

// Mock window.electronAPI for renderer tests
global.window = global.window || {}
global.window.electronAPI = {
  getSyncAfterStart: vi.fn().mockResolvedValue(false),
  getPlatform: vi.fn().mockResolvedValue('linux'),
  getEnvConfig: vi.fn().mockResolvedValue({
    expressPort: 3000,
    executionsLimit: 5,
    user: 'migasfree-play',
    password: 'migasfree-play',
  }),
  setCanExit: vi.fn(),
  showWindow: vi.fn().mockResolvedValue(undefined),
  isMinimized: vi.fn().mockResolvedValue(false),
  closeWindow: vi.fn().mockResolvedValue(undefined),
  spawnCommand: vi.fn(),
  killCommand: vi.fn(),
  onCommandStdout: vi.fn().mockReturnValue(() => {}),
  onCommandStderr: vi.fn().mockReturnValue(() => {}),
  onCommandExit: vi.fn().mockReturnValue(() => {}),
  removeCommandListeners: vi.fn(),
}

// Mock Quasar plugins
vi.mock('quasar', async () => {
  const actual = await vi.importActual('quasar')
  return {
    ...actual,
    useQuasar: () => ({
      dark: { isActive: false, set: vi.fn() },
      notify: vi.fn(),
      localStorage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
      },
    }),
    copyToClipboard: vi.fn().mockResolvedValue(undefined),
  }
})
