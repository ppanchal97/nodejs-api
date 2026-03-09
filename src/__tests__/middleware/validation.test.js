const { validateCreateUser, validateUpdateUser, handleValidationErrors } = require('../../middleware/validation');

const runMiddleware = async (req, res, middlewares) => {
  for (const middleware of middlewares) {
    await new Promise((resolve, reject) => {
      middleware(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    // Stop if response was already sent
    if (res.headersSent) break;
  }
};

describe('validation middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      headersSent: false,
      status: jest.fn().mockImplementation(function() {
        this.headersSent = true;
        return this;
      }),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('validateCreateUser', () => {
    it('should pass validation for valid user data', async () => {
      req.body = { name: 'Alice', email: 'alice@example.com', password: 'password123' };
      await runMiddleware(req, res, validateCreateUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail when name is missing', async () => {
      req.body = { email: 'alice@example.com', password: 'password123' };
      await runMiddleware(req, res, validateCreateUser);
      expect(res.status).toHaveBeenCalledWith(422);
    });

    it('should fail when email is invalid', async () => {
      req.body = { name: 'Alice', email: 'not-an-email', password: 'password123' };
      await runMiddleware(req, res, validateCreateUser);
      expect(res.status).toHaveBeenCalledWith(422);
    });

    it('should fail when password is too short', async () => {
      req.body = { name: 'Alice', email: 'alice@example.com', password: 'short' };
      await runMiddleware(req, res, validateCreateUser);
      expect(res.status).toHaveBeenCalledWith(422);
    });

    it('should fail when name is too short (1 char)', async () => {
      req.body = { name: 'A', email: 'alice@example.com', password: 'password123' };
      await runMiddleware(req, res, validateCreateUser);
      expect(res.status).toHaveBeenCalledWith(422);
    });

    it('should fail when all fields are missing', async () => {
      req.body = {};
      await runMiddleware(req, res, validateCreateUser);
      expect(res.status).toHaveBeenCalledWith(422);
    });
  });

  describe('validateUpdateUser', () => {
    it('should pass validation for empty body (all fields optional)', async () => {
      req.body = {};
      await runMiddleware(req, res, validateUpdateUser);
      expect(next).toHaveBeenCalled();
    });

    it('should pass with valid optional name', async () => {
      req.body = { name: 'New Name' };
      await runMiddleware(req, res, validateUpdateUser);
      expect(next).toHaveBeenCalled();
    });

    it('should pass with valid optional email', async () => {
      req.body = { email: 'newemail@example.com' };
      await runMiddleware(req, res, validateUpdateUser);
      expect(next).toHaveBeenCalled();
    });

    it('should fail with invalid email', async () => {
      req.body = { email: 'not-valid' };
      await runMiddleware(req, res, validateUpdateUser);
      expect(res.status).toHaveBeenCalledWith(422);
    });

    it('should fail with too-short name', async () => {
      req.body = { name: 'X' };
      await runMiddleware(req, res, validateUpdateUser);
      expect(res.status).toHaveBeenCalledWith(422);
    });
  });

  describe('handleValidationErrors', () => {
    it('should call next when no validation errors on request', () => {
      // req without any prior validator context has no errors
      handleValidationErrors(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
