jest.mock('../../src/utils/jwt');
const { verifyToken } = require('../../src/utils/jwt');
const { authenticate } = require('../../src/middleware/authenticate');

describe('authenticate middleware', () => {
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

  it('returns 401 when no Authorization header', () => {
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when header does not start with Bearer', () => {
    req.headers.authorization = 'Basic abc123';
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next and sets req.user when token is valid', () => {
    req.headers.authorization = 'Bearer validtoken';
    verifyToken.mockReturnValue({ id: '42', email: 'user@test.com' });
    authenticate(req, res, next);
    expect(req.user).toEqual({ id: '42', email: 'user@test.com' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 401 when verifyToken throws', () => {
    req.headers.authorization = 'Bearer expiredtoken';
    verifyToken.mockImplementation(() => { throw new Error('jwt expired'); });
    authenticate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });
});
