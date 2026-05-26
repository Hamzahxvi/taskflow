import { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function QuickAdd() {
  const [text, setText] = useState('');
  const { addTask, boards, addToast, fetchData } = useApp();

  const handleKeyDown = async (e) => {
    if (e.key !== 'Enter' || !text.trim()) return;
    await addTask({
      title: text.trim(),
      priority: 'medium',
      board_id: boards[0]?.id || null,
      tags: [],
      subtasks: [],
    });
    setText('');
    addToast('✅ Task added!');
    fetchData();
  };

  return (
    <div className="quick-add-section">
      <div className="quick-add-box">
        <span className="plus-icon">+</span>
        <input
          type="text"
          placeholder="Add a task… press Enter"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="btn-detailed" onClick={() => document.getElementById('taskModalTrigger')?.click()}>⊕ Detailed</button>
      </div>
    </div>
  );
}
