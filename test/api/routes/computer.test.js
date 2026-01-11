import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'

// Mock utils
vi.mock('src/api/utils.js', () => ({
  debug: false,
  pythonExecute: vi.fn(),
}))

import app from 'src/api/index.js'
import { pythonExecute } from 'src/api/utils.js'

describe('Computer Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /computer/id', () => {
    it('should return computer id', async () => {
      pythonExecute.mockResolvedValue('12345')

      const response = await request(app)
        .get('/computer/id')
        .set('Origin', 'http://localhost:9999')

      expect(response.status).toBe(200)
      expect(response.text).toBe('12345')
      expect(pythonExecute).toHaveBeenCalled()
    })

    it('should return 0 on error', async () => {
      pythonExecute.mockRejectedValue(new Error('Failed'))

      const response = await request(app)
        .get('/computer/id')
        .set('Origin', 'http://localhost:9999')

      expect(response.status).toBe(200)
      expect(response.text).toBe('0')
    })
  })

  describe('GET /computer/network', () => {
    it('should return network info', async () => {
      const mockNetwork = { ip: '1.2.3.4' }
      pythonExecute.mockResolvedValue(mockNetwork)

      const response = await request(app)
        .get('/computer/network')
        .set('Origin', 'http://localhost:9999')

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockNetwork)
    })

    it('should handle error', async () => {
      pythonExecute.mockRejectedValue(new Error('Failed'))

      const response = await request(app)
        .get('/computer/network')
        .set('Origin', 'http://localhost:9999')

      expect(response.status).toBe(500)
    })
  })

  describe('POST /computer/register', () => {
    it('should register computer', async () => {
      pythonExecute.mockResolvedValue('Success')

      const response = await request(app)
        .post('/computer/register')
        .set('Origin', 'http://localhost:9999')
        .send({ user: 'u', password: 'p' })

      expect(response.status).toBe(200)
      expect(response.text).toBe('Success')
    })
  })
})
