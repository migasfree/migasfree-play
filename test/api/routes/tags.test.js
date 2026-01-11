import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'

vi.mock('src/api/utils.js', () => ({
  debug: false,
  pythonExecute: vi.fn(),
}))

import app from 'src/api/index.js'
import { pythonExecute } from 'src/api/utils.js'

describe('Tags Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /tags', () => {
    it('should return tags', async () => {
      const mockTags = { assigned: ['tag1'], available: { tag2: 'desc' } }
      pythonExecute.mockResolvedValue(mockTags)

      const response = await request(app)
        .get('/tags')
        .set('Origin', 'http://localhost:9999')

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockTags)
    })
  })
})
