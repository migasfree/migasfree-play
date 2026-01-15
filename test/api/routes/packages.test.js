import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'

// Mock utils before importing app/routes
vi.mock('src/api/utils.js', () => ({
  debug: false,
  pythonExecute: vi.fn(),
  getScriptsPath: vi.fn(() => '/mock/scripts'),
}))

import app from 'src/api/index.js'
import { pythonExecute } from 'src/api/utils.js'

describe('Packages Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /packages/available', () => {
    it('should return available packages', async () => {
      const mockPackages = ['package1', 'package2']
      pythonExecute.mockResolvedValue(mockPackages)

      const response = await request(app)
        .get('/packages/available')
        .set('Origin', 'http://localhost:9999')
        .query({ version: '5.0' }) // Provide required query param if needed

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockPackages)
      expect(pythonExecute).toHaveBeenCalled()
    })

    it('should handle errors gracefully', async () => {
      pythonExecute.mockRejectedValue(new Error('Python error'))

      const response = await request(app)
        .get('/packages/available')
        .set('Origin', 'http://localhost:9999')
        .query({ version: '5.0' })

      expect(response.status).toBe(500)
      expect(response.body).toEqual([])
    })
  })

  describe('POST /packages/installed', () => {
    it('should return installed packages', async () => {
      const mockInstalled = ['pkg1']
      const packagesToCheck = ['pkg1', 'pkg2']
      pythonExecute.mockResolvedValue(mockInstalled)

      const response = await request(app)
        .post('/packages/installed')
        .set('Origin', 'http://localhost:9999')
        .query({ version: '5.0' })
        .send(packagesToCheck)

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockInstalled)
      expect(pythonExecute).toHaveBeenCalled()
    })
  })

  describe('GET /packages/inventory', () => {
    it('should return inventory', async () => {
      const mockInventory = [{ name: 'pkg1' }]
      pythonExecute.mockResolvedValue(mockInventory)

      const response = await request(app)
        .get('/packages/inventory')
        .set('Origin', 'http://localhost:9999')
        .query({ version: '5.0' })

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockInventory)
    })
  })
})
