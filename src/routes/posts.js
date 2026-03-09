const express = require('express');
const router = express.Router();
const { getAllPosts, getPostById, createPost, updatePost, deletePost } = require('../controllers/postController');
const { authenticate } = require('../middleware/authenticate');
const { validatePost } = require('../middleware/validate');

router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.post('/', authenticate, validatePost, createPost);
router.put('/:id', authenticate, validatePost, updatePost);
router.delete('/:id', authenticate, deletePost);

module.exports = router;
