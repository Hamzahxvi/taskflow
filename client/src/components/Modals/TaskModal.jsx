import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './TaskModal.css';

export default function TaskModal({ triggerId }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('medium');
  const [due, setDue] = useState('');
  const [board, setBoard] = useState('');
  const [tags, setTags] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);

  const { tasks, boards, addTask, editTask, addToast } = useApp();

  const resetForm = () => {
    setTitle(''); setDesc(''); setPriority('medium'); setDue('');
    setBoard(boards[0]?.id || ''); setTags(''); setSubtasks([]); setEditingId(null);
  };

  const handleOpen = () => {
    const id = window.__editingTaskId;
    if (id) {
      const task = tasks.find(t => t.id === id);
      if (task) {
        setTitle(task.title);
        setDesc(task.description || '');
        setPriority(task.priority);
        setDue(task.due_date || '');
        setBoard(task.board_id || '');
        setTags(task.tags.join(', '));
        setSubtasks(task.subtasks || []);
        setEditingId(id);
      }
      delete window.__editingTaskId;
    } else {
      resetForm();
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const tagList = tags.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

    if (editingId) {
      await editTask(editingId, {
        title: trimmedTitle,
        description: desc.trim(),
        priority,
        due_date: due,
        board_id: board,
        tags: tagList,
        subtasks,
      });
      addToast('✏️ Task updated!');
    } else {
      await addTask({
        title: trimmedTitle,
        description: desc.trim(),
        priority,
        due_date: due,
        board_id: board,
        tags: tagList,
        subtasks,
      });
      addToast('✅ Task added!');
    }
    handleClose();
  };

  const addSubtask = () => {
    if (!subtaskInput.trim()) return;
    setSubtasks(prev => [...prev, { id: 's_' + Date.now(), text: subtaskInput.trim(), done: false }]);
    setSubtaskInput('');
  };

  const toggleSubtask = (idx) => {
    setSubtasks(prev => prev.map((s, i) => i === idx ? { ...s, done: !s.done } : s));
  };

  const removeSubtask = (idx) => {
    setSubtasks(prev => prev.filter((_, i) => i !== idx));
  };

  // Listen for external trigger
  useEffect(() => {
    const el = document.getElementById(triggerId);
    if (!el) return;
    const handler = () => handleOpen();
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  }, [tasks, boards]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-box">
        <div className="modal-header">
          <h3>{editingId ? 'Edit Task' : 'Add Task'}</h3>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Task Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs to be done?" autoFocus />
          </div>
          <div className="form-group">
            <label>Notes / Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Add details, links, or context…" rows={3} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" value={due} onChange={e => setDue(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Board</label>
            <select value={board} onChange={e => setBoard(e.target.value)}>
              {boards.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Tags <span className="label-hint">(comma separated)</span></label>
            <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. work, urgent, cs-final" />
          </div>
          <div className="subtask-section">
            <label>Subtasks</label>
            <div id="subtaskList">
              {subtasks.map((s, i) => (
                <div key={s.id} className="subtask-item">
                  <input type="checkbox" checked={s.done} onChange={() => toggleSubtask(i)} />
                  <span>{s.text}</span>
                  <button onClick={() => removeSubtask(i)}>×</button>
                </div>
              ))}
            </div>
            <div className="subtask-add">
              <input type="text" value={subtaskInput} onChange={e => setSubtaskInput(e.target.value)}
                     placeholder="Add subtask…" onKeyDown={e => e.key === 'Enter' && addSubtask()} />
              <button onClick={addSubtask}>+</button>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit}>{editingId ? 'Save Changes' : 'Add Task'}</button>
        </div>
      </div>
    </div>
  );
}
