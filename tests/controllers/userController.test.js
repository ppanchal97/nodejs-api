const db = require('../../src/db');
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../../src/controllers/userController');

describe('userController', () => {
  let req, res, next;

  beforeEach(() => {
    db.reset();
    db.users = [
      { id: '1', email: 'user1@test.com', name: 'User One', password: 'hash1' },
      { id: '2', email: 'user2@test.com', name: 'User Two', password: 'hash2' }
    ];
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('getAllUsers', () => {
    it('returns 200 with all users stripped of passwords', () => {
      req = {};
      getAllUsers(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      const body = res.json.mock.calls[0][0];
      expect(body.data).toHaveLength(2);
      expect(body.data[0]).not.toHaveProperty('password');
      expect(body.data[1]).not.toHaveProperty('password');
    });

    it('returns empty array when no users exist', () => {
      db.users = [];
      req = {};
      getAllUsers(req, res, next);
      const body = res.json.mock.calls[0][0];
      expect(body.data).toHaveLength(0);
    });
  });

  describe('getUserById', () => {
    it('returns 200 with user when found', () => {
      req = { params: { id: '1' } };
      getUserById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      const body = res.json.mock.calls[0][0];
      expect(body.data.id).toBe('1');
      expect(body.data).not.toHaveProperty('password');
    });

    it('returns 404 when user is not found', () => {
      req = { params: { id: '999' } };
      getUserById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });
  });

  describe('updateUser', () => {
    it('updates name when authorized user matches', () => {
      req = { params: { id: '1' }, user: { id: '1' }, body: { name: 'Updated Name' } };
      updateUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(db.users[0].name).toBe('Updated Name');
    });

    it('updates email when provided', () => {
      req = { params: { id: '1' }, user: { id: '1' }, body: { email: 'new@email.com' } };
      updateUser(req, res, next);
      expect(db.users[0].email).toBe('new@email.com');
    });

    it('does not change fields that are not provided', () => {
      req = { params: { id: '1' }, user: { id: '1' }, body: {} };
      updateUser(req, res, next);
      expect(db.users[0].name).toBe('User One');
      expect(db.users[0].email).toBe('user1@test.com');
    });

    it('returns 404 when user does not exist', () => {
      req = { params: { id: '999' }, user: { id: '999' }, body: { name: 'X' } };
      updateUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 403 when user is not the account owner', () => {
      req = { params: { id: '1' }, user: { id: '2' }, body: { name: 'Hacker' } };
      updateUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Forbidden' });
    });
  });

  describe('deleteUser', () => {
    it('deletes user when authorized', () => {
      req = { params: { id: '1' }, user: { id: '1' } };
      deleteUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(db.users).toHaveLength(1);
      expect(db.users[0].id).toBe('2');
    });

    it('returns 404 when user does not exist', () => {
      req = { params: { id: '999' }, user: { id: '999' } };
      deleteUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 403 when user is not the account owner', () => {
      req = { params: { id: '1' }, user: { id: '2' } };
      deleteUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(db.users).toHaveLength(2);
    });
  });
});
