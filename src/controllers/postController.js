const db = require('../db');
const { successResponse } = require('../utils/response');

const getAllPosts = (req, res, next) => {
  try {
    return successResponse(res, db.posts, 'Posts retrieved');
  } catch (err) {
    next(err);
  }
};

const getPostById = (req, res, next) => {
  try {
    const post = db.posts.find(p => p.id === req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    return successResponse(res, post, 'Post retrieved');
  } catch (err) {
    next(err);
  }
};

const createPost = (req, res, next) => {
  try {
    const { title, content } = req.body;
    const post = {
      id: db.generateId(),
      title,
      content,
      authorId: req.user.id,
      createdAt: new Date().toISOString()
    };
    db.posts.push(post);
    return successResponse(res, post, 'Post created', 201);
  } catch (err) {
    next(err);
  }
};

const updatePost = (req, res, next) => {
  try {
    const idx = db.posts.findIndex(p => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    if (db.posts[idx].authorId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const { title, content } = req.body;
    if (title !== undefined) db.posts[idx].title = title;
    if (content !== undefined) db.posts[idx].content = content;
    return successResponse(res, db.posts[idx], 'Post updated');
  } catch (err) {
    next(err);
  }
};

const deletePost = (req, res, next) => {
  try {
    const idx = db.posts.findIndex(p => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    if (db.posts[idx].authorId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    db.posts.splice(idx, 1);
    return successResponse(res, null, 'Post deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllPosts, getPostById, createPost, updatePost, deletePost };
