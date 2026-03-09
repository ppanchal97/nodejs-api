'use strict';

const request = require('supertest');
const app = require('../../src/app');
const { reset } = require('../../src/store');

const AUTH = 'Bearer token-1';

beforeEach(() => reset());

describe('GET /api/users', () => {
  it('returns 200 with array of users, no passwords (happy path)', async () => {
    const res = await request(app).get('/api/users').set('Authorization', AUTH);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    res.body.forEach(u => expect(u).not.toHaveProperty('password'));
  });

  it('returns 401 without a token (error case)', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  it('returns 401 with an invalid token (error case)', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer token-9999');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/users/:id', () => {
  it('returns 200 with the requested user (happy path)', async () => {
    const res = await request(app).get('/api/users/1').set('Authorization', AUTH);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: '1', name: 'Alice' });
    expect(res.body).not.toHaveProperty('password');
  });

  it('returns 404 for a non-existent user ID (error case)', async () => {
    const res = await request(app).get('/api/users/9999').set('Authorization', AUTH);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 without a token (error case)', async () => {
    const res = await request(app).get('/api/users/1');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/users', () => {
  it('creates a user and returns 201 with no password exposed (happy path)', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', AUTH)
      .send({ name: 'Charlie', email: 'charlie@example.com', password: 'pass789' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toMatchObject({ name: 'Charlie', email: 'charlie@example.com' });
    expect(res.body).not.toHaveProperty('password');
  });

  it('returns 400 when name is missing (error case)', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', AUTH)
      .send({ email: 'x@example.com', password: 'pass' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when email is missing (error case)', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', AUTH)
      .send({ name: 'X', password: 'pass' });
    expect(res.status).toBe(400);
  });

  it('returns 409 when email is already taken (error case)', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', AUTH)
      .send({ name: 'Dupe', email: 'alice@example.com', password: 'pass' });
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 without a token (error case)', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'X', email: 'x@x.com', password: 'pass' });
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/users/:id', () => {
  it('updates a user and returns 200 (happy path)', async () => {
    const res = await request(app)
      .put('/api/users/1')
      .set('Authorization', AUTH)
      .send({ name: 'Alice Updated' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: '1', name: 'Alice Updated' });
    expect(res.body).not.toHaveProperty('password');
  });

  it('returns 404 for a non-existent user (error case)', async () => {
    const res = await request(app)
      .put('/api/users/9999')
      .set('Authorization', AUTH)
      .send({ name: 'Ghost' });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 without a token (error case)', async () => {
    const res = await request(app).put('/api/users/1').send({ name: 'X' });
    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/users/:id', () => {
  it('deletes a user and returns 204 (happy path)', async () => {
    const res = await request(app).delete('/api/users/2').set('Authorization', AUTH);
    expect(res.status).toBe(204);
  });

  it('returns 404 for a non-existent user (error case)', async () => {
    const res = await request(app).delete('/api/users/9999').set('Authorization', AUTH);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 without a token (error case)', async () => {
    const res = await request(app).delete('/api/users/1');
    expect(res.status).toBe(401);
  });
});
