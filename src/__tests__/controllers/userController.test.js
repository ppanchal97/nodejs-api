const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../../controllers/userController');
const userService = require('../../services/userService');

jest.mock('../../services/userService');

describe('userController', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return 200 with list of users', async () => {
      const mockUsers = [{ id: '1', name: 'Alice', email: 'alice@example.com' }];
      userService.getAllUsers.mockResolvedValue(mockUsers);

      await getAllUsers(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockUsers });
    });

    it('should call next with error on failure', async () => {
      const error = new Error('DB error');
      userService.getAllUsers.mockRejectedValue(error);

      await getAllUsers(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getUserById', () => {
    it('should return 200 with user when found', async () => {
      const mockUser = { id: '1', name: 'Alice', email: 'alice@example.com' };
      req.params.id = '1';
      userService.getUserById.mockResolvedValue(mockUser);

      await getUserById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockUser });
    });

    it('should return 404 when user not found', async () => {
      req.params.id = 'nonexistent';
      userService.getUserById.mockResolvedValue(null);

      await getUserById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });

    it('should call next with error on failure', async () => {
      req.params.id = '1';
      const error = new Error('DB error');
      userService.getUserById.mockRejectedValue(error);

      await getUserById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createUser', () => {
    it('should return 201 with created user', async () => {
      req.body = { name: 'Bob', email: 'bob@example.com', password: 'secret123' };
      const mockUser = { id: '2', name: 'Bob', email: 'bob@example.com' };
      userService.createUser.mockResolvedValue(mockUser);

      await createUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockUser });
    });

    it('should return 409 on duplicate email', async () => {
      req.body = { name: 'Bob', email: 'bob@example.com', password: 'secret123' };
      const error = new Error('User already exists');
      error.code = 'DUPLICATE_EMAIL';
      userService.createUser.mockRejectedValue(error);

      await createUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: error.message });
    });

    it('should call next for non-duplicate errors', async () => {
      req.body = { name: 'Bob', email: 'bob@example.com', password: 'secret123' };
      const error = new Error('DB error');
      userService.createUser.mockRejectedValue(error);

      await createUser(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateUser', () => {
    it('should return 200 with updated user', async () => {
      req.params.id = '1';
      req.body = { name: 'Updated Alice' };
      const mockUser = { id: '1', name: 'Updated Alice', email: 'alice@example.com' };
      userService.updateUser.mockResolvedValue(mockUser);

      await updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockUser });
    });

    it('should return 404 when user not found', async () => {
      req.params.id = 'nonexistent';
      req.body = { name: 'Updated' };
      userService.updateUser.mockResolvedValue(null);

      await updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });

    it('should call next with error on failure', async () => {
      req.params.id = '1';
      const error = new Error('DB error');
      userService.updateUser.mockRejectedValue(error);

      await updateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteUser', () => {
    it('should return 200 on successful deletion', async () => {
      req.params.id = '1';
      userService.deleteUser.mockResolvedValue(true);

      await deleteUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'User deleted successfully' });
    });

    it('should return 404 when user not found', async () => {
      req.params.id = 'nonexistent';
      userService.deleteUser.mockResolvedValue(false);

      await deleteUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });

    it('should call next with error on failure', async () => {
      req.params.id = '1';
      const error = new Error('DB error');
      userService.deleteUser.mockRejectedValue(error);

      await deleteUser(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
