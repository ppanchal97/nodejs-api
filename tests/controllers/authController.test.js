jest.mock('../../src/utils/hash');
jest.mock('../../src/utils/jwt');

const { hashPassword, comparePassword } = require('../../src/utils/hash');
const { generateToken } = require('../../src/utils/jwt');
const db = require('../../src/db');
const { register, login } = require('../../src/controllers/authController');

describe('authController', () => {
  let req, res, next;

  beforeEach(() => {
    db.reset();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    hashPassword.mockResolvedValue('$hashed_password');
    generateToken.mockReturnValue('mock_jwt_token');
    jest.clearAllMocks();
    hashPassword.mockResolvedValue('$hashed_password');
    generateToken.mockReturnValue('mock_jwt_token');
  });

  describe('register', () => {
    it('creates a new user and returns 201 with token', async () => {
      req = { body: { email: 'new@test.com', password: 'password123', name: 'New User' } };
      await register(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      const body = res.json.mock.calls[0][0];
      expect(body.success).toBe(true);
      expect(body.data.token).toBe('mock_jwt_token');
      expect(body.data.user).not.toHaveProperty('password');
      expect(db.users).toHaveLength(1);
    });

    it('assigns empty string when name is not provided', async () => {
      req = { body: { email: 'noname@test.com', password: 'password123' } };
      await register(req, res, next);
      expect(db.users[0].name).toBe('');
    });

    it('returns 409 when email already exists', async () => {
      db.users.push({ id: '99', email: 'taken@test.com', password: 'hash', name: 'User' });
      req = { body: { email: 'taken@test.com', password: 'password123' } };
      await register(req, res, next);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Email already in use' });
    });

    it('calls next(err) when hashPassword throws', async () => {
      hashPassword.mockRejectedValue(new Error('Hash error'));
      req = { body: { email: 'new@test.com', password: 'password123' } };
      await register(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('login', () => {
    beforeEach(() => {
      db.users.push({ id: '1', email: 'user@test.com', password: '$hashed', name: 'User' });
      comparePassword.mockResolvedValue(true);
    });

    it('returns 200 with token on valid credentials', async () => {
      req = { body: { email: 'user@test.com', password: 'password123' } };
      await login(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      const body = res.json.mock.calls[0][0];
      expect(body.success).toBe(true);
      expect(body.data.token).toBe('mock_jwt_token');
      expect(body.data.user).not.toHaveProperty('password');
    });

    it('returns 401 when user is not found', async () => {
      req = { body: { email: 'nobody@test.com', password: 'password123' } };
      await login(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid credentials' });
    });

    it('returns 401 when password does not match', async () => {
      comparePassword.mockResolvedValue(false);
      req = { body: { email: 'user@test.com', password: 'wrongpassword' } };
      await login(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid credentials' });
    });

    it('calls next(err) when comparePassword throws', async () => {
      comparePassword.mockRejectedValue(new Error('Bcrypt error'));
      req = { body: { email: 'user@test.com', password: 'password123' } };
      await login(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
