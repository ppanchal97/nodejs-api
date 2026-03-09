const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validateCreateUser, validateUpdateUser } = require('../middleware/validation');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

router.get('/', authenticate, getAllUsers);
router.get('/:id', authenticate, getUserById);
router.post('/', validateCreateUser, createUser);
router.put('/:id', authenticate, validateUpdateUser, updateUser);
router.delete('/:id', authenticate, deleteUser);

module.exports = router;
