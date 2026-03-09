const bcrypt = require('bcryptjs');
const userService = require('../../services/userService');

jest.mock('bcryptjs');
jest.mock('../../utils/helpers', () => ({
  generateId: jest.fn().mockReturnValue('test-id-123')
}));

describe('userService', () => {
  beforeEach(() => {
    userService._reset();
    jest.clearAllMocks();
    bcrypt.hash.mockResolvedValue('hashed-password');
    bcrypt.compare.mockResolvedValue(true);
  });

  describe('getAllUsers', () => {
    it('should return empty array when no users', async () => {
      const result = await userService.getAllUsers();
      expect(result).toEqual([]);
    });

    it('should return users without passwords', async () => {
      const { generateId } = require('../../utils/helpers');
      generateId.mockReturnValue('test-id-abc');
      await userService.createUser({ name: 'Alice', email: 'alice@test.com', password: 'pass1234' });
      const users = await userService.getAllUsers();

      expect(users).toHaveLength(1);
      expect(users[0]).not.toHaveProperty('password');
      expect(users[0]).toHaveProperty('name', 'Alice');
    });
  });

  describe('getUserById', () => {
    it('should return null for non-existent user', async () => {
      const result = await userService.getUserById('nonexistent');
      expect(result).toBeNull();
    });

    it('should return user without password', async () => {
      const { generateId } = require('../../utils/helpers');
      generateId.mockReturnValue('find-id-123');
      await userService.createUser({ name: 'Bob', email: 'bob@test.com', password: 'pass1234' });
      const user = await userService.getUserById('find-id-123');

      expect(user).not.toBeNull();
      expect(user).not.toHaveProperty('password');
      expect(user.name).toBe('Bob');
    });
  });

  describe('createUser', () => {
    it('should create a user with hashed password', async () => {
      const { generateId } = require('../../utils/helpers');
      generateId.mockReturnValue('new-user-id');
      const userData = { name: 'Charlie', email: 'charlie@test.com', password: 'pass1234' };
      const result = await userService.createUser(userData);

      expect(bcrypt.hash).toHaveBeenCalledWith('pass1234', 10);
      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('id', 'new-user-id');
      expect(result).toHaveProperty('name', 'Charlie');
      expect(result).toHaveProperty('email', 'charlie@test.com');
    });

    it('should throw DUPLICATE_EMAIL error for existing email', async () => {
      await userService.createUser({ name: 'Dave', email: 'dave@test.com', password: 'pass1234' });

      await expect(
        userService.createUser({ name: 'Dave2', email: 'dave@test.com', password: 'pass1234' })
      ).rejects.toMatchObject({ code: 'DUPLICATE_EMAIL' });
    });

    it('should set createdAt timestamp', async () => {
      const result = await userService.createUser({ name: 'Eve', email: 'eve@test.com', password: 'pass1234' });
      expect(result).toHaveProperty('createdAt');
      expect(new Date(result.createdAt)).toBeInstanceOf(Date);
    });
  });

  describe('updateUser', () => {
    it('should return null for non-existent user', async () => {
      const result = await userService.updateUser('nonexistent', { name: 'New Name' });
      expect(result).toBeNull();
    });

    it('should update user fields', async () => {
      const { generateId } = require('../../utils/helpers');
      generateId.mockReturnValue('update-id-123');
      await userService.createUser({ name: 'Frank', email: 'frank@test.com', password: 'pass1234' });
      const updated = await userService.updateUser('update-id-123', { name: 'Updated Frank' });

      expect(updated).not.toBeNull();
      expect(updated.name).toBe('Updated Frank');
      expect(updated).not.toHaveProperty('password');
    });

    it('should set updatedAt timestamp', async () => {
      const { generateId } = require('../../utils/helpers');
      generateId.mockReturnValue('ts-id-123');
      await userService.createUser({ name: 'Grace', email: 'grace@test.com', password: 'pass1234' });
      const updated = await userService.updateUser('ts-id-123', { name: 'Updated Grace' });

      expect(updated).toHaveProperty('updatedAt');
    });
  });

  describe('deleteUser', () => {
    it('should return false for non-existent user', async () => {
      const result = await userService.deleteUser('nonexistent');
      expect(result).toBe(false);
    });

    it('should delete user and return true', async () => {
      const { generateId } = require('../../utils/helpers');
      generateId.mockReturnValue('del-id-123');
      await userService.createUser({ name: 'Henry', email: 'henry@test.com', password: 'pass1234' });
      const result = await userService.deleteUser('del-id-123');

      expect(result).toBe(true);
      const users = await userService.getAllUsers();
      expect(users).toHaveLength(0);
    });
  });
});
