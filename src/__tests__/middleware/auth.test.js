const jwt = require('jsonwebtoken');
const { authenticate, generateToken } = require('../../middleware/auth');

jest.mock('jsonwebtoken');

describe('auth middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should return 401 when no authorization header', () => {
      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'No authorization header' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid format (no Bearer prefix)', () => {
      req.headers.authorization = 'InvalidToken';

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid authorization format' });
    });

    it('should return 401 for wrong scheme (Basic instead of Bearer)', () => {
      req.headers.authorization = 'Basic sometoken';

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid authorization format' });
    });

    it('should return 401 for expired token', () => {
      req.headers.authorization = 'Bearer expired-token';
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => { throw error; });

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Token expired' });
    });

    it('should return 401 for invalid token', () => {
      req.headers.authorization = 'Bearer invalid-token';
      jwt.verify.mockImplementation(() => { throw new Error('Invalid'); });

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid token' });
    });

    it('should call next and set req.user for valid token', () => {
      req.headers.authorization = 'Bearer valid-token';
      const decodedUser = { id: '1', email: 'user@test.com' };
      jwt.verify.mockReturnValue(decodedUser);

      authenticate(req, res, next);

      expect(req.user).toEqual(decodedUser);
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('generateToken', () => {
    it('should call jwt.sign with payload and options', () => {
      const payload = { id: '1' };
      jwt.sign.mockReturnValue('mocked-token');

      const token = generateToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(payload, expect.any(String), { expiresIn: '1h' });
      expect(token).toBe('mocked-token');
    });

    it('should return signed token', () => {
      jwt.sign.mockReturnValue('signed-jwt-token');
      const token = generateToken({ userId: 'abc' });
      expect(token).toBe('signed-jwt-token');
    });
  });
});
