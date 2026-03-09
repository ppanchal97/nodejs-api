'use strict';

function createInitialState() {
  return {
    users: [
      { id: '1', name: 'Alice', email: 'alice@example.com', password: 'password123' },
      { id: '2', name: 'Bob', email: 'bob@example.com', password: 'password456' },
    ],
    items: [
      { id: '1', name: 'Widget', price: 9.99, userId: '1' },
      { id: '2', name: 'Gadget', price: 24.99, userId: '2' },
    ],
    nextUserId: 3,
    nextItemId: 3,
  };
}

const state = createInitialState();

function reset() {
  const fresh = createInitialState();
  state.users = fresh.users;
  state.items = fresh.items;
  state.nextUserId = fresh.nextUserId;
  state.nextItemId = fresh.nextItemId;
}

module.exports = { state, reset };
