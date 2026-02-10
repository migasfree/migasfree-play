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
    executionsLimit: 5,
    user: 'migasfree-play',
    password: 'migasfree-play',
  }),
  setCanExit: vi.fn(),
  show: vi.fn().mockResolvedValue(undefined),
  isMinimized: vi.fn().mockResolvedValue(false),
  close: vi.fn().mockResolvedValue(undefined),
  spawnCommand: vi.fn(),
  killCommand: vi.fn(),
  onCommandStdout: vi.fn().mockReturnValue(() => {}),
  onCommandStderr: vi.fn().mockReturnValue(() => {}),
  onCommandExit: vi.fn().mockReturnValue(() => {}),
  removeCommandListeners: vi.fn(),

  // Nested APIs
  preferences: {
    read: vi.fn(),
    write: vi.fn(),
    getClientInfo: vi.fn(),
    getProtocol: vi.fn(),
    canManageDevices: vi.fn(),
    getServerInfo: vi.fn(),
  },
  tags: {
    get: vi.fn(),
  },
  packages: {
    getAvailable: vi.fn(),
    getInstalled: vi.fn(),
    getInventory: vi.fn(),
  },
  computer: {
    getData: vi.fn(),
    getId: vi.fn(),
    getNetwork: vi.fn(),
    register: vi.fn(),
  },
  executions: {
    read: vi.fn(),
    write: vi.fn(),
  },
  token: {
    read: vi.fn(),
    write: vi.fn(),
    remove: vi.fn(),
  },
  user: {
    isPrivileged: vi.fn(),
    check: vi.fn(),
  },
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
