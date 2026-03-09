'use strict';

const request = require('supertest');
const app = require('../../src/app');
const { reset } = require('../../src/store');

const AUTH = 'Bearer token-1';

beforeEach(() => reset());

describe('GET /api/items', () => {
  it('returns 200 with a list of items, no auth required (happy path)', async () => {
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('returns 404 for an unrecognised sub-resource (error case)', async () => {
    // PATCH is not defined on /api/items, so it falls through to the global 404 handler
    const res = await request(app).patch('/api/items');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/items/:id', () => {
  it('returns 200 with the requested item (happy path)', async () => {
    const res = await request(app).get('/api/items/1');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: '1', name: 'Widget' });
  });

  it('returns 404 for a non-existent item (error case)', async () => {
    const res = await request(app).get('/api/items/9999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

describe('POST /api/items', () => {
  it('creates an item and returns 201 (happy path)', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', AUTH)
      .send({ name: 'Thingamajig', price: 14.99 });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toMatchObject({ name: 'Thingamajig', price: 14.99 });
  });

  it('returns 400 when name is missing (error case)', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', AUTH)
      .send({ price: 9.99 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when price is missing (error case)', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', AUTH)
      .send({ name: 'Doohickey' });
    expect(res.status).toBe(400);
  });

  it('returns 401 without a token (error case)', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'Widget', price: 9.99 });
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/items/:id', () => {
  it('updates an item and returns 200 (happy path)', async () => {
    const res = await request(app)
      .put('/api/items/1')
      .set('Authorization', AUTH)
      .send({ price: 19.99 });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: '1', price: 19.99 });
  });

  it('returns 404 for a non-existent item (error case)', async () => {
    const res = await request(app)
      .put('/api/items/9999')
      .set('Authorization', AUTH)
      .send({ price: 1.0 });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 without a token (error case)', async () => {
    const res = await request(app).put('/api/items/1').send({ price: 1.0 });
    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/items/:id', () => {
  it('deletes an item and returns 204 (happy path)', async () => {
    const res = await request(app).delete('/api/items/2').set('Authorization', AUTH);
    expect(res.status).toBe(204);
  });

  it('returns 404 for a non-existent item (error case)', async () => {
    const res = await request(app).delete('/api/items/9999').set('Authorization', AUTH);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 without a token (error case)', async () => {
    const res = await request(app).delete('/api/items/1');
    expect(res.status).toBe(401);
  });
});
