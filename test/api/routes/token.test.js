import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import fs from 'fs'

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal()
  const mocks = {
    ...actual,
    existsSync: vi.fn(),
    promises: {
      readFile: vi.fn(),
      writeFile: vi.fn(),
      mkdir: vi.fn(),
    },
  }
  return {
    ...mocks,
    default: mocks,
  }
})

import app from 'src/api/index.js'

describe('Token Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /token', () => {
    it('should return token', async () => {
      fs.existsSync.mockReturnValue(true)
      fs.promises.readFile.mockResolvedValue('mytoken')

      const response = await request(app)
        .get('/token')
        .set('Origin', 'http://localhost:9999')

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ token: 'mytoken' })
    })

    it('should return empty string if no token', async () => {
      fs.existsSync.mockReturnValue(false)

      const response = await request(app)
        .get('/token')
        .set('Origin', 'http://localhost:9999')

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ token: '' })
    })
  })

  describe('POST /token', () => {
    it('should save token', async () => {
      fs.promises.mkdir.mockResolvedValue()
      fs.promises.writeFile.mockResolvedValue()

      const response = await request(app)
        .post('/token')
        .set('Origin', 'http://localhost:9999')
        .send({ token: 'newtoken' })

      expect(response.status).toBe(201)
    })

    it('should validate token', async () => {
      const response = await request(app)
        .post('/token')
        .set('Origin', 'http://localhost:9999')
        .send({ token: '' })

      expect(response.status).toBe(400)
    })
  })
})
