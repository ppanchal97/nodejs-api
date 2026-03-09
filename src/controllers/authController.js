'use strict';

const { state } = require('../store');

function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  const user = state.users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = `token-${user.id}`;
  res.status(200).json({ token, userId: user.id });
}

module.exports = { login };
