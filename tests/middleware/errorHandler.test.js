const { errorHandler, notFound } = require('../../src/middleware/errorHandler');

describe('errorHandler middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { originalUrl: '/test' };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    delete process.env.NODE_ENV;
  });

  it('uses err.statusCode when present', () => {
    const err = { statusCode: 422, message: 'Unprocessable Entity' };
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Unprocessable Entity' });
  });

  it('defaults to 500 when no statusCode', () => {
    const err = new Error('Server crash');
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('uses default message when err.message is missing', () => {
    errorHandler({}, req, res, next);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Internal Server Error' })
    );
  });

  it('includes stack trace in development environment', () => {
    process.env.NODE_ENV = 'development';
    const err = new Error('Dev error');
    errorHandler(err, req, res, next);
    const call = res.json.mock.calls[0][0];
    expect(call).toHaveProperty('stack');
  });

  it('excludes stack trace in non-development', () => {
    process.env.NODE_ENV = 'production';
    const err = new Error('Prod error');
    errorHandler(err, req, res, next);
    const call = res.json.mock.calls[0][0];
    expect(call).not.toHaveProperty('stack');
  });
});

describe('notFound middleware', () => {
  it('calls next with a 404 error containing the URL', () => {
    const req = { originalUrl: '/missing' };
    const res = {};
    const next = jest.fn();
    notFound(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(404);
    expect(err.message).toContain('/missing');
  });
});
