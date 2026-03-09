const db = require('../db');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');
const { successResponse } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const existing = db.users.find(u => u.email === email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }
    const hashedPassword = await hashPassword(password);
    const user = {
      id: db.generateId(),
      email,
      name: name || '',
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    const token = generateToken({ id: user.id, email: user.email });
    const { password: _, ...userWithoutPassword } = user;
    return successResponse(res, { user: userWithoutPassword, token }, 'User registered', 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = generateToken({ id: user.id, email: user.email });
    const { password: _, ...userWithoutPassword } = user;
    return successResponse(res, { user: userWithoutPassword, token }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
