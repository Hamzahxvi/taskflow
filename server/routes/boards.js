const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const boards = db.prepare('SELECT * FROM boards WHERE user_id = ? ORDER BY created_at').all(req.userId);
  res.json({ boards });
});

router.post('/', (req, res) => {
  const { name, color } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Board name is required' });
  }

  const id = uuidv4();
  db.prepare('INSERT INTO boards (id, user_id, name, color) VALUES (?,?,?,?)')
    .run(id, req.userId, name.trim(), color || '#00C896');

  const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(id);
  res.status(201).json({ board });
});

router.delete('/:id', (req, res) => {
  const board = db.prepare('SELECT * FROM boards WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!board) {
    return res.status(404).json({ error: 'Board not found' });
  }

  db.prepare('UPDATE tasks SET board_id = NULL WHERE board_id = ? AND user_id = ?').run(req.params.id, req.userId);
  db.prepare('DELETE FROM boards WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ success: true });
});

module.exports = router;
