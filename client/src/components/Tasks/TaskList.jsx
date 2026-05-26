import { useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import TaskCard from './TaskCard';
import QuickAdd from './QuickAdd';
import './TaskList.css';

export default function TaskList() {
  const {
    tasks, filter, activeBoard, activeTag, searchQuery, sortBy, setSortBy, viewMode, setViewMode,
    reorder, setSidebarOpen, boards,
  } = useApp();

  const today = new Date().toISOString().split('T')[0];

  let filtered = [...tasks];

  switch (filter) {
    case 'today': filtered = filtered.filter(t => t.due_date === today && !t.done); break;
    case 'upcoming': filtered = filtered.filter(t => t.due_date > today && !t.done); break;
    case 'completed': filtered = filtered.filter(t => t.done); break;
    case 'high': filtered = filtered.filter(t => t.priority === 'high' && !t.done); break;
    case 'board': filtered = filtered.filter(t => t.board_id === activeBoard); break;
    case 'tag': filtered = filtered.filter(t => t.tags.includes(activeTag)); break;
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q) ||
      t.tags.some(g => g.toLowerCase().includes(q))
    );
  }

  filtered.sort((a, b) => {
    if (sortBy === 'due') {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    }
    if (sortBy === 'priority') {
      const p = { high: 0, medium: 1, low: 2 };
      return p[a.priority] - p[b.priority];
    }
    if (sortBy === 'alpha') return a.title.localeCompare(b.title);
    return (b.sort_order || 0) - (a.sort_order || 0);
  });

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.done).length;
  const pct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  let dragId = null;

  const handleDragStart = (e, id) => {
    dragId = id;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (dragId === targetId) return;
    const fromIdx = filtered.findIndex(t => t.id === dragId);
    const toIdx = filtered.findIndex(t => t.id === targetId);
    if (fromIdx < 0 || toIdx < 0) return;
    const reordered = [...filtered];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    reorder(reordered);
    dragId = null;
  };

  const filterTitles = {
    all: 'All Tasks', today: 'Today', upcoming: 'Upcoming',
    completed: 'Completed', high: 'High Priority',
    board: boards?.find(b => b.id === activeBoard)?.name || 'Board',
    tag: '#' + activeTag,
  };

  return (
    <main className={`main-content ${useApp().sidebarOpen ? '' : 'expanded'}`}>
      <div className="main-header">
        <div className="header-left">
          <button className="hamburger" onClick={() => setSidebarOpen(prev => !prev)}>☰</button>
          <div>
            <h2>{filterTitles[filter] || 'Tasks'}</h2>
            <span className="count-badge">{filtered.length} {filtered.length === 1 ? 'task' : 'tasks'}</span>
          </div>
        </div>
        <div className="header-right">
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="created">↕ Created</option>
            <option value="due">📅 Due Date</option>
            <option value="priority">🔴 Priority</option>
            <option value="alpha">A–Z</option>
          </select>
          <div className="view-btns">
            <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>≡</button>
            <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>⊞</button>
          </div>
        </div>
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-meta">
          <span>{doneTasks} of {totalTasks} completed</span>
          <span>{pct}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: pct + '%' }} />
        </div>
      </div>

      <QuickAdd />

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗂️</div>
          <h3>Nothing here yet</h3>
          <p>Add your first task to get started!</p>
          <button className="btn-primary" onClick={() => document.getElementById('taskModalTrigger')?.click()}>+ Add Task</button>
        </div>
      ) : (
        <div className={`task-list ${viewMode === 'grid' ? 'grid-view' : ''}`}>
          {filtered.map(task => (
            <TaskCard key={task.id} task={task} onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop} />
          ))}
        </div>
      )}
    </main>
  );
}
