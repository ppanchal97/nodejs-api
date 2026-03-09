const { requestLogger } = require('../../middleware/requestLogger');

describe('requestLogger middleware', () => {
  let req, res, next;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    req = { method: 'GET', path: '/api/test' };
    res = {
      statusCode: 200,
      on: jest.fn()
    };
    next = jest.fn();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should call next', () => {
    requestLogger(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should register a finish event listener on the response', () => {
    requestLogger(req, res, next);
    expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
  });

  it('should not log in test environment when finish fires', () => {
    process.env.NODE_ENV = 'test';
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    requestLogger(req, res, next);
    const finishHandler = res.on.mock.calls[0][1];
    finishHandler();

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should log in development environment when finish fires', () => {
    process.env.NODE_ENV = 'development';
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    requestLogger(req, res, next);
    const finishHandler = res.on.mock.calls[0][1];
    finishHandler();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should include method, path, statusCode in log output', () => {
    process.env.NODE_ENV = 'production';
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    requestLogger(req, res, next);
    const finishHandler = res.on.mock.calls[0][1];
    finishHandler();

    const logArg = consoleSpy.mock.calls[0][0];
    expect(logArg).toContain('GET');
    expect(logArg).toContain('/api/test');
    expect(logArg).toContain('200');
    consoleSpy.mockRestore();
  });
});
