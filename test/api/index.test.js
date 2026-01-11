import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from 'src/api/index.js'

describe('Express App', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app)
      .get('/unknown-route')
      .set('Origin', 'http://localhost:9999')
    // Express default 404 handler or your custom one
    expect(response.status).toBe(404) // Or 500 depending on your error handler if it doesn't handle 404s gracefully
  })
})
