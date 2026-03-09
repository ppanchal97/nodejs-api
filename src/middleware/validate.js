const validateUser = (req, res, next) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }
  next();
};

const validatePost = (req, res, next) => {
  const { title, content } = req.body || {};
  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }
  if (title.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Title cannot be empty' });
  }
  next();
};

module.exports = { validateUser, validatePost };
