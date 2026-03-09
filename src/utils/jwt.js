const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'nodejs_api_test_secret_key';

const generateToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: '1d' });
};

const verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};

module.exports = { generateToken, verifyToken };
