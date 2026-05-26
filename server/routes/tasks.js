const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Get all tasks for user
router.get('/', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY sort_order DESC, created_at DESC').all(req.userId);

  const subtasks = db.prepare(`
    SELECT s.* FROM subtasks s
    JOIN tasks t ON s.task_id = t.id
    WHERE t.user_id = ?
  `).all(req.userId);

  const tasksWithSubs = tasks.map(t => ({
    ...t,
    tags: JSON.parse(t.tags || '[]'),
    done: !!t.done,
    subtasks: subtasks.filter(s => s.task_id === t.id).map(s => ({ ...s, done: !!s.done })),
  }));

  res.json({ tasks: tasksWithSubs });
});

// Create task
router.post('/', (req, res) => {
  const { title, description, priority, due_date, board_id, tags, subtasks } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const id = uuidv4();
  const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM tasks WHERE user_id = ?').get(req.userId);
  const sortOrder = (maxOrder?.max || 0) + 1;

  db.prepare(`
    INSERT INTO tasks (id, user_id, board_id, title, description, priority, due_date, tags, done, sort_order)
    VALUES (?,?,?,?,?,?,?,?,0,?)
  `).run(id, req.userId, board_id || null, title.trim(), description || '', priority || 'medium', due_date || '', JSON.stringify(tags || []), sortOrder);

  if (subtasks && Array.isArray(subtasks)) {
    const insertSub = db.prepare('INSERT INTO subtasks (id, task_id, text, done) VALUES (?,?,?,0)');
    subtasks.forEach(s => {
      if (s.text && s.text.trim()) {
        insertSub.run(uuidv4(), id, s.text.trim());
      }
    });
  }

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  const subs = db.prepare('SELECT * FROM subtasks WHERE task_id = ?').all(id);
  res.status(201).json({ task: { ...task, tags: JSON.parse(task.tags || '[]'), done: false, subtasks: subs.map(s => ({ ...s, done: !!s.done })) } });
});

// Update task
router.put('/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { title, description, priority, due_date, board_id, tags, done, subtasks, sort_order } = req.body;

  db.prepare(`
    UPDATE tasks SET
      title = ?, description = ?, priority = ?, due_date = ?,
      board_id = ?, tags = ?, done = ?, sort_order = ?
    WHERE id = ? AND user_id = ?
  `).run(
    title ?? task.title,
    description ?? task.description,
    priority ?? task.priority,
    due_date ?? task.due_date,
    board_id ?? task.board_id,
    JSON.stringify(tags ?? JSON.parse(task.tags || '[]')),
    done !== undefined ? (done ? 1 : 0) : task.done,
    sort_order ?? task.sort_order,
    req.params.id,
    req.userId
  );

  // Update subtasks if provided
  if (subtasks !== undefined) {
    db.prepare('DELETE FROM subtasks WHERE task_id = ?').run(req.params.id);
    if (Array.isArray(subtasks)) {
      const insertSub = db.prepare('INSERT INTO subtasks (id, task_id, text, done) VALUES (?,?,?,?)');
      subtasks.forEach(s => {
        if (s.text && s.text.trim()) {
          insertSub.run(s.id || uuidv4(), req.params.id, s.text.trim(), s.done ? 1 : 0);
        }
      });
    }
  }

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  const subs = db.prepare('SELECT * FROM subtasks WHERE task_id = ?').all(req.params.id);
  res.json({ task: { ...updated, tags: JSON.parse(updated.tags || '[]'), done: !!updated.done, subtasks: subs.map(s => ({ ...s, done: !!s.done })) } });
});

// Delete task
router.delete('/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  db.prepare('DELETE FROM subtasks WHERE task_id = ?').run(req.params.id);
  db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ success: true });
});

// Reorder tasks
router.put('/reorder/batch', (req, res) => {
  const { tasks: taskUpdates } = req.body;
  if (!Array.isArray(taskUpdates)) {
    return res.status(400).json({ error: 'tasks array required' });
  }

  const update = db.prepare('UPDATE tasks SET sort_order = ? WHERE id = ? AND user_id = ?');
  const tx = db.transaction(() => {
    taskUpdates.forEach(({ id, sort_order }) => {
      update.run(sort_order, id, req.userId);
    });
  });
  tx();

  res.json({ success: true });
});

module.exports = router;
