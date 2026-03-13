import { describe, it, expect, vi } from 'vitest'
import {
  appIcon,
  techIcon,
  modelIcon,
  productIcon,
  cpuIcon,
  elementIcon,
  useElement,
} from 'src/composables/element'

// Mock vue3-gettext
vi.mock('vue3-gettext', () => ({
  useGettext: () => ({
    $gettext: (msg) => msg,
  }),
}))

describe('Element Composable Icons & Labels', () => {
  describe('appIcon()', () => {
    it('returns correct icon for known key', () => {
      expect(appIcon('apps')).toBe('mdi-view-grid-outline')
      expect(appIcon('dark')).toBe('mdi-weather-night')
    })

    it('returns empty string for unknown key', () => {
      expect(appIcon('non-existent')).toBe('')
    })
  })

  describe('techIcon()', () => {
    it('returns correct icon for known key', () => {
      expect(techIcon('usb')).toBe('mdi-usb-port')
      expect(techIcon('cpu')).toBe('mdi-chip')
    })

    it('returns empty string for unknown key', () => {
      expect(techIcon('quantum-processor')).toBe('')
    })
  })

  describe('modelIcon()', () => {
    it('returns correct icon for known key', () => {
      expect(modelIcon('computers')).toBe('mdi-monitor-dashboard')
    })
  })

  describe('productIcon()', () => {
    it('returns correct icon for known product', () => {
      expect(productIcon('laptop')).toBe('mdi-laptop')
    })

    it('returns empty string for unknown product', () => {
      expect(productIcon('smart-fridge')).toBe('')
    })
  })

  describe('cpuIcon()', () => {
    it('returns 64-bit icon for x86_64', () => {
      expect(cpuIcon('x86_64')).toBe('mdi-cpu-64-bit')
    })

    it('returns 32-bit icon for i386/i686', () => {
      expect(cpuIcon('i386')).toBe('mdi-cpu-32-bit')
      expect(cpuIcon('i686')).toBe('mdi-cpu-32-bit')
    })

    it('returns default chip icon for unknown arch', () => {
      expect(cpuIcon('armv7')).toBe('mdi-chip')
    })
  })

  describe('elementIcon()', () => {
    it('returns correct icon for known status', () => {
      expect(elementIcon('intended')).toBe('mdi-heart-pulse')
    })

    it('returns unknown icon for undefined or empty status', () => {
      expect(elementIcon('')).toBe('mdi-crosshairs-question')
      expect(elementIcon(null)).toBe('mdi-crosshairs-question')
    })

    it('returns unknown icon for unknown status string', () => {
      expect(elementIcon('exploded')).toBe('mdi-crosshairs-question')
    })
  })

  describe('computerStatus()', () => {
    it('returns translated label for known status', () => {
      const { computerStatus } = useElement()
      expect(computerStatus('intended')).toBe('Intended')
      expect(computerStatus('available')).toBe('Available')
    })

    it('returns Unknown for unknown status', () => {
      const { computerStatus } = useElement()
      expect(computerStatus('unknown-state')).toBe('Unknown')
    })
  })

  describe('useElement() composable', () => {
    it('exports all helper functions', () => {
      const element = useElement()
      expect(element.appIcon).toBeInstanceOf(Function)
      expect(element.computerStatus).toBeInstanceOf(Function)
      expect(element.elementIcon).toBeInstanceOf(Function)
    })
  })
})
