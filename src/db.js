const db = {
  users: [],
  posts: [],
  _nextId: 1,
  generateId() {
    return String(this._nextId++);
  },
  reset() {
    this.users = [];
    this.posts = [];
    this._nextId = 1;
  }
};

module.exports = db;
