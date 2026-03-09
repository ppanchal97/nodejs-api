const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { validateUser } = require('../middleware/validate');

router.post('/register', validateUser, register);
router.post('/login', validateUser, login);

module.exports = router;
