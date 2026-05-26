import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './TaskModal.css';

const COLORS = ['#00C896', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export default function BoardModal({ triggerId }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#00C896');
  const [open, setOpen] = useState(false);
  const { addBoard, addToast } = useApp();

  const handleClose = () => {
    setOpen(false);
    setName('');
    setColor('#00C896');
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    addBoard({ name: name.trim(), color });
    handleClose();
    addToast('📁 Board "' + name.trim() + '" created!');
  };

  useEffect(() => {
    const el = document.getElementById(triggerId);
    if (!el) return;
    const handler = () => setOpen(true);
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  }, []);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-box modal-sm">
        <div className="modal-header">
          <h3>New Board</h3>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Board Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
                   placeholder="e.g. Work, Personal, Study…" autoFocus
                   onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          <div className="form-group">
            <label>Colour</label>
            <div className="color-picker">
              {COLORS.map(c => (
                <div key={c} className={`color-dot ${color === c ? 'selected' : ''}`}
                     style={{ background: c }} onClick={() => setColor(c)} />
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit}>Create</button>
        </div>
      </div>
    </div>
  );
}
