const { errorHandler, createError } = require('../../middleware/errorHandler');

describe('errorHandler middleware', () => {
  let req, res, next;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('errorHandler', () => {
    it('should return 500 for generic error', () => {
      const error = new Error('Something went wrong');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: 'Something went wrong' })
      );
    });

    it('should use custom statusCode from error', () => {
      const error = new Error('Not found');
      error.statusCode = 404;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should default to 500 and Internal Server Error message when missing', () => {
      const error = {};

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Internal Server Error' })
      );
    });

    it('should include stack in development mode', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Dev error');

      errorHandler(error, req, res, next);

      const jsonArg = res.json.mock.calls[0][0];
      expect(jsonArg).toHaveProperty('stack');
    });

    it('should not include stack in production mode', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Prod error');

      errorHandler(error, req, res, next);

      const jsonArg = res.json.mock.calls[0][0];
      expect(jsonArg).not.toHaveProperty('stack');
    });

    it('should not log in test environment', () => {
      process.env.NODE_ENV = 'test';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');

      errorHandler(error, req, res, next);

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('createError', () => {
    it('should create an error with message and statusCode', () => {
      const error = createError('Test error', 400);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
    });

    it('should default to 500 statusCode', () => {
      const error = createError('Test error');
      expect(error.statusCode).toBe(500);
    });

    it('should return an instance of Error', () => {
      const error = createError('Custom error', 422);
      expect(error).toBeInstanceOf(Error);
    });
  });
});
