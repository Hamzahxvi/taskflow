import { useApp } from '../../context/AppContext';
import './Sidebar.css';

export default function Sidebar() {
  const {
    user, boards, tasks, darkMode, toggleDark,
    filter, setFilter, activeBoard, setActiveBoard,
    activeTag, setActiveTag, searchQuery, setSearchQuery,
    sidebarOpen, setSidebarOpen, logout, addToast,
    removeBoard,
  } = useApp();

  const handleFilter = (f) => {
    setFilter(f);
    setActiveBoard(null);
    setActiveTag(null);
    if (window.innerWidth <= 768) setSidebarOpen(false);
  };

  const handleBoard = (boardId) => {
    setActiveBoard(boardId);
    setActiveTag(null);
    setFilter('board');
    if (window.innerWidth <= 768) setSidebarOpen(false);
  };

  const handleTag = (tag) => {
    if (activeTag === tag) {
      setActiveTag(null);
      setFilter('all');
    } else {
      setActiveTag(tag);
      setFilter('tag');
      document.querySelector('.nav-item.active')?.classList.remove('active');
    }
    if (window.innerWidth <= 768) setSidebarOpen(false);
  };

  const handleDeleteBoard = (e, id) => {
    e.stopPropagation();
    removeBoard(id);
    addToast('🗑 Board deleted.', 'error');
  };

  const allTags = [...new Set(tasks.flatMap(t => t.tags))].filter(Boolean);
  const today = new Date().toISOString().split('T')[0];

  const counts = {
    all: tasks.filter(t => !t.done).length,
    today: tasks.filter(t => !t.done && t.due_date === today).length,
    upcoming: tasks.filter(t => !t.done && t.due_date > today).length,
    done: tasks.filter(t => t.done).length,
    high: tasks.filter(t => !t.done && t.priority === 'high').length,
  };

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
      <div className="sidebar-top">
        <div className="sidebar-logo">✦ TaskFlow</div>
        <button className="icon-btn theme-btn" onClick={toggleDark}>{darkMode ? '☀️' : '🌙'}</button>
        <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>✕</button>
      </div>

      <div className="user-card">
        <div className="user-avatar">{(user?.name || user?.username || 'U')[0].toUpperCase()}</div>
        <div>
          <div className="user-name">{user?.name || user?.username}</div>
          <div className="user-status"><span className="dot" /> Active</div>
        </div>
      </div>

      <div className="sidebar-search">
        <input type="text" placeholder="Search tasks…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      </div>

      <nav className="sidebar-nav">
        <div className="nav-label">Views</div>
        <a className={`nav-item ${filter === 'all' ? 'active' : ''}`} onClick={() => handleFilter('all')}>
          <span>📋</span> All Tasks <span className="nav-badge">{counts.all}</span>
        </a>
        <a className={`nav-item ${filter === 'today' ? 'active' : ''}`} onClick={() => handleFilter('today')}>
          <span>☀️</span> Today <span className="nav-badge">{counts.today}</span>
        </a>
        <a className={`nav-item ${filter === 'upcoming' ? 'active' : ''}`} onClick={() => handleFilter('upcoming')}>
          <span>📅</span> Upcoming <span className="nav-badge">{counts.upcoming}</span>
        </a>
        <a className={`nav-item ${filter === 'completed' ? 'active' : ''}`} onClick={() => handleFilter('completed')}>
          <span>✅</span> Completed <span className="nav-badge">{counts.done}</span>
        </a>
        <a className={`nav-item ${filter === 'high' ? 'active' : ''}`} onClick={() => handleFilter('high')}>
          <span>🔴</span> High Priority <span className="nav-badge">{counts.high}</span>
        </a>
      </nav>

      <div className="sidebar-section">
        <div className="section-header">
          <span className="nav-label">Boards</span>
          <button className="icon-btn" onClick={() => document.getElementById('boardModalTrigger')?.click()}>+</button>
        </div>
        <div>
          {boards.map(b => {
            const count = tasks.filter(t => t.board_id === b.id && !t.done).length;
            return (
              <div key={b.id} className={`board-item ${activeBoard === b.id ? 'active' : ''}`} onClick={() => handleBoard(b.id)}>
                <div className="board-dot" style={{ background: b.color }} />
                <span className="board-name">{escHtml(b.name)}</span>
                <span className="board-count">{count}</span>
                <button className="board-del" onClick={(e) => handleDeleteBoard(e, b.id)}>×</button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="sidebar-section">
        <div className="nav-label">Tags</div>
        <div className="tags-cloud">
          {allTags.map(tag => (
            <span key={tag} className={`tag-pill ${activeTag === tag ? 'active' : ''}`} onClick={() => handleTag(tag)}>
              #{escHtml(tag)}
            </span>
          ))}
        </div>
      </div>

      <div className="sidebar-footer">
        <button className="btn-logout" onClick={logout}>↩ Sign Out</button>
      </div>
    </aside>
  );
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
