import { useApp } from '../../context/AppContext';

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${parseInt(d)} ${months[parseInt(m)-1]}`;
}

export default function TaskCard({ task, onDragStart, onDragOver, onDrop }) {
  const { toggleTaskDone, removeTask, addToast, boards } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const addDays = (n) => { const d = new Date(); d.setDate(d.getDate()+n); return d.toISOString().split('T')[0]; };

  const doneClass = task.done ? 'done' : '';
  const prioClass = `p-${task.priority}`;

  let dueHtml = '';
  if (task.due_date) {
    let cls = 'meta-due';
    let label = '📅 ' + formatDate(task.due_date);
    if (!task.done && task.due_date < today) { cls += ' overdue'; label = '⚠️ Overdue · ' + formatDate(task.due_date); }
    else if (!task.done && task.due_date === today) { cls += ' soon'; label = '☀️ Today'; }
    else if (!task.done && task.due_date === addDays(1)) { cls += ' soon'; label = '🌅 Tomorrow'; }
    dueHtml = <span className={cls}>{label}</span>;
  }

  const board = boards.find(b => b.id === task.board_id);
  const boardDot = board ? <span className="meta-tag" style={{ borderColor: board.color, color: board.color }}>◉ {escHtml(board.name)}</span> : null;

  let subtaskBar = null;
  if (task.subtasks && task.subtasks.length > 0) {
    const done = task.subtasks.filter(s => s.done).length;
    const pct = Math.round((done / task.subtasks.length) * 100);
    subtaskBar = (
      <div className="subtask-bar">
        <div className="subtask-progress">{done}/{task.subtasks.length} subtasks</div>
        <div className="subtask-track"><div className="subtask-fill" style={{ width: pct + '%' }} /></div>
      </div>
    );
  }

  const handleToggle = async (e) => {
    e.stopPropagation();
    await toggleTaskDone(task.id);
    addToast(task.done ? '↩ Task reopened.' : '🎉 Task completed!');
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    await removeTask(task.id);
    addToast('🗑 Task deleted.', 'error');
  };

  const handleEdit = () => {
    window.__editingTaskId = task.id;
    document.getElementById('taskModalTrigger')?.click();
  };

  return (
    <div
      className={`task-card ${doneClass} ${prioClass}`}
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, task.id)}
    >
      <div className={`task-check ${task.done ? 'checked' : ''}`} onClick={handleToggle} />
      <div className="task-body" onClick={handleEdit}>
        <div className="task-title">{escHtml(task.title)}</div>
        {task.description && <div className="task-desc">{escHtml(task.description)}</div>}
        <div className="task-meta">
          <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
          {dueHtml}
          {boardDot}
          {task.tags.map(tag => <span key={tag} className="meta-tag">#{escHtml(tag)}</span>)}
        </div>
        {subtaskBar}
      </div>
      <div className="task-actions">
        <button className="task-action-btn" onClick={handleEdit} title="Edit">✏️</button>
        <button className="task-action-btn del" onClick={handleDelete} title="Delete">🗑</button>
      </div>
    </div>
  );
}
