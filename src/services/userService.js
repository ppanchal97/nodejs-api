const bcrypt = require('bcryptjs');
const { generateId } = require('../utils/helpers');

// In-memory data store (replace with DB in production)
let users = [];

const getAllUsers = async () => {
  return users.map(({ password, ...user }) => user);
};

const getUserById = async (id) => {
  const user = users.find(u => u.id === id);
  if (!user) return null;
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

const createUser = async ({ name, email, password }) => {
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    const error = new Error(`User with email ${email} already exists`);
    error.code = 'DUPLICATE_EMAIL';
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    id: generateId(),
    name,
    email,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };
  users.push(user);
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

const updateUser = async (id, updates) => {
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;

  users[index] = { ...users[index], ...updates, id, updatedAt: new Date().toISOString() };
  const { password, ...userWithoutPassword } = users[index];
  return userWithoutPassword;
};

const deleteUser = async (id) => {
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return false;
  users.splice(index, 1);
  return true;
};

// Exposed for test isolation
const _reset = () => { users = []; };

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser, _reset };
