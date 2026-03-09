const db = require('../db');
const { successResponse } = require('../utils/response');

const getAllUsers = (req, res, next) => {
  try {
    const users = db.users.map(({ password, ...u }) => u);
    return successResponse(res, users, 'Users retrieved');
  } catch (err) {
    next(err);
  }
};

const getUserById = (req, res, next) => {
  try {
    const user = db.users.find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { password, ...userWithoutPassword } = user;
    return successResponse(res, userWithoutPassword, 'User retrieved');
  } catch (err) {
    next(err);
  }
};

const updateUser = (req, res, next) => {
  try {
    const idx = db.users.findIndex(u => u.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const { name, email } = req.body;
    if (name !== undefined) db.users[idx].name = name;
    if (email !== undefined) db.users[idx].email = email;
    const { password, ...userWithoutPassword } = db.users[idx];
    return successResponse(res, userWithoutPassword, 'User updated');
  } catch (err) {
    next(err);
  }
};

const deleteUser = (req, res, next) => {
  try {
    const idx = db.users.findIndex(u => u.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    db.users.splice(idx, 1);
    return successResponse(res, null, 'User deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
