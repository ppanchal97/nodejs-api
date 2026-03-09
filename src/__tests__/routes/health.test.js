const request = require('supertest');
const app = require('../../app');

describe('GET /api/health', () => {
  it('should return 200 with health status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      uptime: expect.any(Number),
      timestamp: expect.any(String)
    });
  });

  it('should return JSON content-type', async () => {
    const response = await request(app).get('/api/health');
    expect(response.headers['content-type']).toMatch(/json/);
  });
});
