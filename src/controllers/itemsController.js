'use strict';

const { state } = require('../store');

function listItems(req, res) {
  res.status(200).json(state.items);
}

function getItem(req, res) {
  const item = state.items.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.status(200).json(item);
}

function createItem(req, res) {
  const { name, price } = req.body || {};
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'name and price are required' });
  }
  const item = { id: String(state.nextItemId++), name, price, userId: req.user.id };
  state.items.push(item);
  res.status(201).json(item);
}

function updateItem(req, res) {
  const idx = state.items.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Item not found' });
  const { name, price } = req.body || {};
  if (name) state.items[idx].name = name;
  if (price !== undefined) state.items[idx].price = price;
  res.status(200).json(state.items[idx]);
}

function deleteItem(req, res) {
  const idx = state.items.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Item not found' });
  state.items.splice(idx, 1);
  res.status(204).send();
}

module.exports = { listItems, getItem, createItem, updateItem, deleteItem };
