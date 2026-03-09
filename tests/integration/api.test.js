const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/db');
const { generateToken } = require('../../src/utils/jwt');

describe('API Integration Tests', () => {
  let authToken;

  beforeEach(() => {
    db.reset();
    authToken = generateToken({ id: '1', email: 'test@test.com' });
  });

  describe('Auth Routes', () => {
    describe('POST /api/auth/register', () => {
      it('registers a new user successfully', async () => {
        const res = await request(app)
          .post('/api/auth/register')
          .send({ email: 'new@test.com', password: 'password123', name: 'New User' });
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.token).toBeDefined();
        expect(res.body.data.user).not.toHaveProperty('password');
      });

      it('returns 409 for duplicate email', async () => {
        await request(app).post('/api/auth/register').send({ email: 'dup@test.com', password: 'password123' });
        const res = await request(app).post('/api/auth/register').send({ email: 'dup@test.com', password: 'password123' });
        expect(res.status).toBe(409);
      });

      it('returns 400 for invalid email', async () => {
        const res = await request(app).post('/api/auth/register').send({ email: 'bademail', password: 'password123' });
        expect(res.status).toBe(400);
      });

      it('returns 400 for short password', async () => {
        const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com', password: 'abc' });
        expect(res.status).toBe(400);
      });
    });

    describe('POST /api/auth/login', () => {
      beforeEach(async () => {
        await request(app).post('/api/auth/register').send({ email: 'login@test.com', password: 'password123', name: 'Login User' });
      });

      it('logs in with correct credentials', async () => {
        const res = await request(app).post('/api/auth/login').send({ email: 'login@test.com', password: 'password123' });
        expect(res.status).toBe(200);
        expect(res.body.data.token).toBeDefined();
      });

      it('returns 401 for wrong password', async () => {
        const res = await request(app).post('/api/auth/login').send({ email: 'login@test.com', password: 'wrongpass' });
        expect(res.status).toBe(401);
      });

      it('returns 401 for unknown email', async () => {
        const res = await request(app).post('/api/auth/login').send({ email: 'nobody@test.com', password: 'password123' });
        expect(res.status).toBe(401);
      });
    });
  });

  describe('User Routes', () => {
    beforeEach(() => {
      db.users = [{ id: '1', email: 'test@test.com', name: 'Test User', password: 'hash' }];
    });

    it('GET /api/users - returns 401 without token', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(401);
    });

    it('GET /api/users - returns users when authenticated', async () => {
      const res = await request(app).get('/api/users').set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('GET /api/users/:id - returns user by id', async () => {
      const res = await request(app).get('/api/users/1').set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('1');
    });

    it('GET /api/users/:id - returns 404 for unknown id', async () => {
      const res = await request(app).get('/api/users/99').set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(404);
    });

    it('PUT /api/users/:id - updates user name', async () => {
      const res = await request(app)
        .put('/api/users/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' });
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Name');
    });

    it('PUT /api/users/:id - returns 403 for non-owner', async () => {
      db.users.push({ id: '2', email: 'other@test.com', name: 'Other', password: 'hash' });
      const res = await request(app)
        .put('/api/users/2')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Hacked' });
      expect(res.status).toBe(403);
    });

    it('DELETE /api/users/:id - deletes own account', async () => {
      const res = await request(app)
        .delete('/api/users/1')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(db.users).toHaveLength(0);
    });
  });

  describe('Post Routes', () => {
    beforeEach(() => {
      db.posts = [
        { id: '1', title: 'Post One', content: 'Content 1', authorId: '1' },
        { id: '2', title: 'Post Two', content: 'Content 2', authorId: '99' }
      ];
    });

    it('GET /api/posts - returns all posts without auth', async () => {
      const res = await request(app).get('/api/posts');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
    });

    it('GET /api/posts/:id - returns post by id', async () => {
      const res = await request(app).get('/api/posts/1');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('1');
    });

    it('GET /api/posts/:id - returns 404 for unknown id', async () => {
      const res = await request(app).get('/api/posts/999');
      expect(res.status).toBe(404);
    });

    it('POST /api/posts - returns 401 without token', async () => {
      const res = await request(app).post('/api/posts').send({ title: 'Test', content: 'Content' });
      expect(res.status).toBe(401);
    });

    it('POST /api/posts - creates post when authenticated', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'New Post', content: 'Content here' });
      expect(res.status).toBe(201);
      expect(res.body.data.authorId).toBe('1');
    });

    it('POST /api/posts - returns 400 when title missing', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'No title' });
      expect(res.status).toBe(400);
    });

    it('PUT /api/posts/:id - updates post when author', async () => {
      const res = await request(app)
        .put('/api/posts/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title', content: 'Updated Content' });
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated Title');
    });

    it('PUT /api/posts/:id - returns 403 when not author', async () => {
      const res = await request(app)
        .put('/api/posts/2')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Hacked', content: 'Bad content' });
      expect(res.status).toBe(403);
    });

    it('PUT /api/posts/:id - returns 404 for unknown post', async () => {
      const res = await request(app)
        .put('/api/posts/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'X', content: 'Y' });
      expect(res.status).toBe(404);
    });

    it('DELETE /api/posts/:id - deletes post when author', async () => {
      const res = await request(app)
        .delete('/api/posts/1')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(db.posts).toHaveLength(1);
    });

    it('DELETE /api/posts/:id - returns 404 for unknown post', async () => {
      const res = await request(app)
        .delete('/api/posts/999')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(404);
    });

    it('DELETE /api/posts/:id - returns 403 when not author', async () => {
      const res = await request(app)
        .delete('/api/posts/2')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(403);
    });
  });
});
