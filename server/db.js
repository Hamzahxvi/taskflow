const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const db = new Database(path.join(__dirname, 'taskflow.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS boards (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#00C896',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    board_id TEXT REFERENCES boards(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low','medium','high')),
    due_date TEXT,
    tags TEXT DEFAULT '[]',
    done INTEGER DEFAULT 0,
    sort_order REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS subtasks (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    done INTEGER DEFAULT 0
  );
`);

// seed demo user if not exists
const demoExists = db.prepare('SELECT id FROM users WHERE username = ?').get('demo');
if (!demoExists) {
  const bcrypt = require('bcryptjs');
  const demoId = uuidv4();
  const hash = bcrypt.hashSync('demo123', 10);

  db.prepare('INSERT INTO users (id, username, name, password_hash) VALUES (?,?,?,?)')
    .run(demoId, 'demo', 'Demo User', hash);

  const b1 = uuidv4(), b2 = uuidv4(), b3 = uuidv4();
  db.prepare('INSERT INTO boards (id, user_id, name, color) VALUES (?,?,?,?)').run(b1, demoId, 'Personal', '#00C896');
  db.prepare('INSERT INTO boards (id, user_id, name, color) VALUES (?,?,?,?)').run(b2, demoId, 'Work', '#3B82F6');
  db.prepare('INSERT INTO boards (id, user_id, name, color) VALUES (?,?,?,?)').run(b3, demoId, 'Study', '#8B5CF6');

  const today = new Date().toISOString().split('T')[0];
  const addDays = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
  };

  const seedTasks = [
    { title: 'Set up GitHub repository', desc: 'Push project to GitHub and enable Pages', priority: 'high', due: today, board: b1, tags: ['dev','urgent'], done: 0, order: 0 },
    { title: 'Complete final year project', desc: 'Finish the capstone project report', priority: 'high', due: addDays(3), board: b3, tags: ['fyp','school'], done: 0, order: 1 },
    { title: 'Review data structures notes', desc: '', priority: 'medium', due: addDays(1), board: b3, tags: ['study'], done: 0, order: 2 },
    { title: 'Update LinkedIn profile', desc: 'Add recent projects and skills', priority: 'low', due: addDays(7), board: b1, tags: ['career'], done: 0, order: 3 },
    { title: 'Buy groceries', desc: 'Milk, eggs, bread, coffee', priority: 'medium', due: today, board: b1, tags: ['personal'], done: 1, order: 4 },
    { title: 'Submit internship application', desc: '', priority: 'high', due: addDays(2), board: b2, tags: ['career','urgent'], done: 0, order: 5 },
  ];

  const insertTask = db.prepare('INSERT INTO tasks (id, user_id, board_id, title, description, priority, due_date, tags, done, sort_order) VALUES (?,?,?,?,?,?,?,?,?,?)');
  const insertSubtask = db.prepare('INSERT INTO subtasks (id, task_id, text, done) VALUES (?,?,?,?)');

  seedTasks.forEach(t => {
    const taskId = uuidv4();
    insertTask.run(taskId, demoId, t.board, t.title, t.desc, t.priority, t.due, JSON.stringify(t.tags), t.done, t.order);
  });

  // Add subtasks to first task
  const firstTask = db.prepare('SELECT id FROM tasks WHERE user_id = ? ORDER BY sort_order LIMIT 1').get(demoId);
  if (firstTask) {
    insertSubtask.run(uuidv4(), firstTask.id, 'Create repo', 1);
    insertSubtask.run(uuidv4(), firstTask.id, 'Push code', 0);
  }
}

module.exports = db;
