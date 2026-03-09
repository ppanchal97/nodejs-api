'use strict';

const request = require('supertest');
const app = require('../../src/app');
const { reset } = require('../../src/store');

beforeEach(() => reset());

describe('GET /health', () => {
  it('returns 200 with status ok (happy path)', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('returns 404 for an unknown route (error case)', async () => {
    const res = await request(app).get('/health/nonexistent');
    expect(res.status).toBe(404);
  });
});
