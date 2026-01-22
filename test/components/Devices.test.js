import { describe, it, expect } from 'vitest'

// Test the name helper function logic directly
describe('Devices.vue name helper', () => {
  // Simulating the name function from Devices.vue
  const name = (item) => {
    return (
      item.data?.NAME || `${item.model.manufacturer.name} ${item.model.name}`
    )
  }

  it('returns data.NAME when present and non-empty', () => {
    const item = {
      data: { NAME: 'Custom Printer Name' },
      model: { name: 'LaserJet', manufacturer: { name: 'HP' } },
    }
    expect(name(item)).toBe('Custom Printer Name')
  })

  it('returns manufacturer + model when data.NAME is empty string', () => {
    const item = {
      data: { NAME: '' },
      model: { name: 'LaserJet', manufacturer: { name: 'HP' } },
    }
    expect(name(item)).toBe('HP LaserJet')
  })

  it('returns manufacturer + model when data.NAME is null', () => {
    const item = {
      data: { NAME: null },
      model: { name: 'Scanner', manufacturer: { name: 'Canon' } },
    }
    expect(name(item)).toBe('Canon Scanner')
  })

  it('returns manufacturer + model when data.NAME is undefined', () => {
    const item = {
      data: {},
      model: { name: 'Printer', manufacturer: { name: 'Epson' } },
    }
    expect(name(item)).toBe('Epson Printer')
  })

  it('returns manufacturer + model when data is undefined', () => {
    const item = {
      model: { name: 'Inkjet', manufacturer: { name: 'Brother' } },
    }
    expect(name(item)).toBe('Brother Inkjet')
  })
})

describe('Devices.vue alternativeName helper', () => {
  // Simulating the alternativeName function from Devices.vue
  const alternativeName = (item) => {
    return 'NAME' in item.data
      ? `${item.model.manufacturer.name} ${item.model.name}`
      : ''
  }

  it('returns manufacturer + model when data has NAME key', () => {
    const item = {
      data: { NAME: 'Some Name' },
      model: { name: 'LaserJet', manufacturer: { name: 'HP' } },
    }
    expect(alternativeName(item)).toBe('HP LaserJet')
  })

  it('returns empty string when data has no NAME key', () => {
    const item = {
      data: { IP: '192.168.1.1' },
      model: { name: 'Scanner', manufacturer: { name: 'Canon' } },
    }
    expect(alternativeName(item)).toBe('')
  })
})
