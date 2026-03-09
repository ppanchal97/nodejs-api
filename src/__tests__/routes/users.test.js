const request = require('supertest');
const app = require('../../app');
const userService = require('../../services/userService');
const { generateToken } = require('../../middleware/auth');

jest.mock('../../services/userService');

describe('User routes /api/users', () => {
  let token;

  beforeAll(() => {
    // Use real jwt.sign via generateToken (not mocked here)
    const jwt = require('jsonwebtoken');
    token = jwt.sign({ id: '1', email: 'test@test.com' }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should return 401 without authorization header', async () => {
      const response = await request(app).get('/api/users');
      expect(response.status).toBe(401);
    });

    it('should return 401 with malformed token', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer bad.token.here');
      expect(response.status).toBe(401);
    });

    it('should return 200 with users list when authenticated', async () => {
      userService.getAllUsers.mockResolvedValue([{ id: '1', name: 'Alice', email: 'alice@test.com' }]);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 500 when service throws', async () => {
      userService.getAllUsers.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/users', () => {
    it('should create user with valid data', async () => {
      userService.createUser.mockResolvedValue({ id: '2', name: 'Bob', email: 'bob@test.com' });

      const response = await request(app)
        .post('/api/users')
        .send({ name: 'Bob', email: 'bob@test.com', password: 'password123' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 422 with invalid data (short name, bad email, short password)', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ name: 'B', email: 'not-valid', password: 'short' });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('should return 409 on duplicate email', async () => {
      const error = new Error('User already exists');
      error.code = 'DUPLICATE_EMAIL';
      userService.createUser.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/users')
        .send({ name: 'Duplicate', email: 'dup@test.com', password: 'password123' });

      expect(response.status).toBe(409);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by id when authenticated', async () => {
      const mockUser = { id: '1', name: 'Alice', email: 'alice@test.com' };
      userService.getUserById.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/users/1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject(mockUser);
    });

    it('should return 404 when user not found', async () => {
      userService.getUserById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/users/nonexistent')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user when authenticated', async () => {
      userService.updateUser.mockResolvedValue({ id: '1', name: 'Updated', email: 'alice@test.com' });

      const response = await request(app)
        .put('/api/users/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 when user not found', async () => {
      userService.updateUser.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/users/nonexistent')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test' });

      expect(response.status).toBe(404);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .put('/api/users/1')
        .send({ name: 'Test' });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user when authenticated', async () => {
      userService.deleteUser.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/users/1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 when user not found', async () => {
      userService.deleteUser.mockResolvedValue(false);

      const response = await request(app)
        .delete('/api/users/nonexistent')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('should return 401 without token', async () => {
      const response = await request(app).delete('/api/users/1');
      expect(response.status).toBe(401);
    });
  });
});
