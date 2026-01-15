import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'

vi.mock('src/api/utils.js', () => ({
  debug: false,
  pythonExecute: vi.fn(),
  getScriptsPath: vi.fn(() => '/mock/scripts'),
}))

import app from 'src/api/index.js'
import { pythonExecute } from 'src/api/utils.js'

describe('User Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /user/check', () => {
    it('should check user privilege', async () => {
      pythonExecute.mockResolvedValue('True')

      const response = await request(app)
        .post('/user/check')
        .set('Origin', 'http://localhost:9999')
        .send({ username: 'u', password: 'p' })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ is_privileged: true })
    })

    it('should handle false result', async () => {
      pythonExecute.mockResolvedValue('False')

      const response = await request(app)
        .post('/user/check')
        .set('Origin', 'http://localhost:9999')
        .send({ username: 'u', password: 'p' })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ is_privileged: false })
    })
  })
})
