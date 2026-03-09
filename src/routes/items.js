'use strict';

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { listItems, getItem, createItem, updateItem, deleteItem } = require('../controllers/itemsController');

router.get('/', listItems);
router.get('/:id', getItem);
router.post('/', requireAuth, createItem);
router.put('/:id', requireAuth, updateItem);
router.delete('/:id', requireAuth, deleteItem);

module.exports = router;
