const db = require('../../src/db');
const { getAllPosts, getPostById, createPost, updatePost, deletePost } = require('../../src/controllers/postController');

describe('postController', () => {
  let req, res, next;

  beforeEach(() => {
    db.reset();
    db.posts = [
      { id: '1', title: 'Post One', content: 'Content 1', authorId: 'user1' },
      { id: '2', title: 'Post Two', content: 'Content 2', authorId: 'user2' }
    ];
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('getAllPosts', () => {
    it('returns 200 with all posts', () => {
      req = {};
      getAllPosts(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data).toHaveLength(2);
    });

    it('returns empty array when no posts', () => {
      db.posts = [];
      getAllPosts({}, res, next);
      expect(res.json.mock.calls[0][0].data).toHaveLength(0);
    });
  });

  describe('getPostById', () => {
    it('returns 200 with post when found', () => {
      req = { params: { id: '1' } };
      getPostById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].data.id).toBe('1');
    });

    it('returns 404 when post is not found', () => {
      req = { params: { id: '999' } };
      getPostById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Post not found' });
    });
  });

  describe('createPost', () => {
    it('creates a new post and returns 201', () => {
      req = { body: { title: 'New Post', content: 'New Content' }, user: { id: 'user1' } };
      createPost(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(db.posts).toHaveLength(3);
      const body = res.json.mock.calls[0][0];
      expect(body.data.title).toBe('New Post');
      expect(body.data.authorId).toBe('user1');
    });
  });

  describe('updatePost', () => {
    it('updates post title and content when author', () => {
      req = { params: { id: '1' }, user: { id: 'user1' }, body: { title: 'Updated', content: 'Updated Content' } };
      updatePost(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(db.posts[0].title).toBe('Updated');
      expect(db.posts[0].content).toBe('Updated Content');
    });

    it('updates only title when content is not provided', () => {
      req = { params: { id: '1' }, user: { id: 'user1' }, body: { title: 'Only Title' } };
      updatePost(req, res, next);
      expect(db.posts[0].title).toBe('Only Title');
      expect(db.posts[0].content).toBe('Content 1');
    });

    it('returns 404 when post does not exist', () => {
      req = { params: { id: '999' }, user: { id: 'user1' }, body: { title: 'X', content: 'Y' } };
      updatePost(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 403 when user is not the author', () => {
      req = { params: { id: '1' }, user: { id: 'user2' }, body: { title: 'Hacked', content: 'Bad' } };
      updatePost(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('deletePost', () => {
    it('deletes post when user is the author', () => {
      req = { params: { id: '1' }, user: { id: 'user1' } };
      deletePost(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(db.posts).toHaveLength(1);
      expect(db.posts[0].id).toBe('2');
    });

    it('returns 404 when post does not exist', () => {
      req = { params: { id: '999' }, user: { id: 'user1' } };
      deletePost(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns 403 when user is not the author', () => {
      req = { params: { id: '1' }, user: { id: 'user2' } };
      deletePost(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(db.posts).toHaveLength(2);
    });
  });
});
