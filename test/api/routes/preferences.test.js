import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import fs from 'fs'

// Mock utils
vi.mock('src/api/utils.js', () => ({
  debug: false,
  pythonExecute: vi.fn(),
}))

// Mock fs
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal()
  const mocks = {
    ...actual,
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
  }
  return {
    ...mocks,
    default: mocks,
  }
})

import app from 'src/api/index.js'
import { pythonExecute } from 'src/api/utils.js'

describe('Preferences Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /preferences', () => {
    it('should return preferences', async () => {
      const mockSettings = { language: 'en_US' }
      fs.existsSync.mockReturnValue(true)
      fs.readFileSync.mockReturnValue(JSON.stringify(mockSettings))

      const response = await request(app)
        .get('/preferences')
        .set('Origin', 'http://localhost:9999')

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockSettings)
    })

    it('should return default settings if file empty/error', async () => {
      fs.existsSync.mockReturnValue(false)
      fs.readFileSync.mockReturnValue(null) // Simulate reading default or nothing depending on logic
      // Actually logic writes default if not exists.
      // If readSettings returns defaults.

      const response = await request(app)
        .get('/preferences')
        .set('Origin', 'http://localhost:9999')

      expect(response.status).toBe(200)
    })
  })

  describe('POST /preferences', () => {
    it('should save preferences', async () => {
      const response = await request(app)
        .post('/preferences')
        .set('Origin', 'http://localhost:9999')
        .send({ language: 'fr_FR' })

      expect(response.status).toBe(201)
      expect(fs.writeFileSync).toHaveBeenCalled()
    })
  })

  describe('GET /preferences/server', () => {
    it('should return server info', async () => {
      const mockServer = { server: 'myserver' }
      pythonExecute.mockResolvedValue(mockServer)

      const response = await request(app)
        .get('/preferences/server')
        .set('Origin', 'http://localhost:9999')

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockServer)
    })
  })

  describe('GET /preferences/client', () => {
    it('should return client info', async () => {
      const mockClient = { version: '5.0' }
      pythonExecute.mockResolvedValue(mockClient)

      const response = await request(app)
        .get('/preferences/client')
        .set('Origin', 'http://localhost:9999')

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockClient)
    })
  })
})
