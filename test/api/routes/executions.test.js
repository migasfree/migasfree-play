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

describe('Executions Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /executions', () => {
    it('should return executions if file exists', async () => {
      fs.existsSync.mockReturnValue(true)
      const mockData = { exec1: 'done' }
      fs.promises.readFile.mockResolvedValue(JSON.stringify(mockData))

      const response = await request(app)
        .get('/executions')
        .set('Origin', 'http://localhost:9999')

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockData)
    })

    it('should return empty object if file does not exist', async () => {
      fs.existsSync.mockReturnValue(false)

      const response = await request(app)
        .get('/executions')
        .set('Origin', 'http://localhost:9999')

      expect(response.status).toBe(200)
      expect(response.body).toEqual({})
    })
  })

  describe('POST /executions', () => {
    it('should save executions', async () => {
      const dataToSave = { exec1: 'done' }
      fs.promises.mkdir.mockResolvedValue()
      fs.promises.writeFile.mockResolvedValue()

      const response = await request(app)
        .post('/executions')
        .set('Origin', 'http://localhost:9999')
        .send(dataToSave)

      expect(response.status).toBe(200)
      expect(fs.promises.writeFile).toHaveBeenCalled()
    })
  })
})
