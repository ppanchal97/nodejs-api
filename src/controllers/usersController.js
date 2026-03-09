'use strict';

const { state } = require('../store');

function listUsers(req, res) {
  const users = state.users.map(({ password, ...user }) => user);
  res.status(200).json(users);
}

function getUser(req, res) {
  const user = state.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...safeUser } = user;
  res.status(200).json(safeUser);
}

function createUser(req, res) {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }
  if (state.users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'Email already in use' });
  }
  const user = { id: String(state.nextUserId++), name, email, password };
  state.users.push(user);
  const { password: _, ...safeUser } = user;
  res.status(201).json(safeUser);
}

function updateUser(req, res) {
  const idx = state.users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  const { name, email } = req.body || {};
  if (name) state.users[idx].name = name;
  if (email) state.users[idx].email = email;
  const { password, ...safeUser } = state.users[idx];
  res.status(200).json(safeUser);
}

function deleteUser(req, res) {
  const idx = state.users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  state.users.splice(idx, 1);
  res.status(204).send();
}

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser };
