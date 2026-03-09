const { validateUser, validatePost } = require('../../src/middleware/validate');

describe('validate middleware', () => {
  let res, next;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('validateUser', () => {
    it('returns 400 when email is missing', () => {
      const req = { body: { password: 'password123' } };
      validateUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 400 when password is missing', () => {
      const req = { body: { email: 'test@test.com' } };
      validateUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 400 when body is empty', () => {
      const req = { body: {} };
      validateUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 when email format is invalid', () => {
      const req = { body: { email: 'notanemail', password: 'password123' } };
      validateUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Invalid email format' })
      );
    });

    it('returns 400 when password is too short', () => {
      const req = { body: { email: 'test@test.com', password: 'abc' } };
      validateUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Password must be at least 6 characters' })
      );
    });

    it('calls next with valid email and password', () => {
      const req = { body: { email: 'test@test.com', password: 'password123' } };
      validateUser(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('calls next even without optional name field', () => {
      const req = { body: { email: 'a@b.com', password: 'secret99' } };
      validateUser(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('validatePost', () => {
    it('returns 400 when title is missing', () => {
      const req = { body: { content: 'Some content' } };
      validatePost(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 400 when content is missing', () => {
      const req = { body: { title: 'My Title' } };
      validatePost(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 when body is empty', () => {
      const req = { body: {} };
      validatePost(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 400 when title is only whitespace', () => {
      const req = { body: { title: '   ', content: 'Content here' } };
      validatePost(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Title cannot be empty' })
      );
    });

    it('calls next when both title and content are provided', () => {
      const req = { body: { title: 'My Post', content: 'Content here' } };
      validatePost(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
