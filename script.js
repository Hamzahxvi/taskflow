/* ════════════════════════════════════════
   TaskFlow — script.js
   Auth · Tasks · Boards · Tags · UI
   ════════════════════════════════════════ */

// ── State ──────────────────────────────────────────────────
let state = {
    currentUser: null,
    filter: 'all',
    activeBoard: null,
    activeTag: null,
    searchQuery: '',
    viewMode: 'list',
    editingTaskId: null,
    selectedColor: '#00C896',
    tempSubtasks: [],
};

// ── Storage helpers ────────────────────────────────────────
const key = (k) => `tf_${state.currentUser?.id}_${k}`;

function getUsers()       { return JSON.parse(localStorage.getItem('tf_users') || '[]'); }
function saveUsers(u)     { localStorage.setItem('tf_users', JSON.stringify(u)); }
function getTasks()       { return JSON.parse(localStorage.getItem(key('tasks')) || '[]'); }
function saveTasks(t)     { localStorage.setItem(key('tasks'), JSON.stringify(t)); }
function getBoards()      { return JSON.parse(localStorage.getItem(key('boards')) || '[]'); }
function saveBoards(b)    { localStorage.setItem(key('boards'), JSON.stringify(b)); }
function getDark()        { return localStorage.getItem('tf_dark') === '1'; }
function setDark(v)       { localStorage.setItem('tf_dark', v ? '1' : '0'); }

// ── Auth ───────────────────────────────────────────────────
function hashPw(p) { return btoa(unescape(encodeURIComponent(p))); }

function initDemo() {
    const users = getUsers();
    if (!users.find(u => u.username === 'demo')) {
        const demoUser = { id: 'demo', username: 'demo', name: 'Demo User', hash: hashPw('demo123') };
        users.push(demoUser);
        saveUsers(users);
        // seed demo data
        state.currentUser = demoUser;
        const boards = [
            { id: 'b1', name: 'Personal', color: '#00C896' },
            { id: 'b2', name: 'Work', color: '#3B82F6' },
            { id: 'b3', name: 'Study', color: '#8B5CF6' },
        ];
        saveBoards(boards);
        const today = new Date();
        const fmt = (d) => d.toISOString().split('T')[0];
        const add = (n) => { const d = new Date(); d.setDate(d.getDate()+n); return fmt(d); };
        const tasks = [
            { id: 't1', title: 'Set up GitHub repository', desc: 'Push project to GitHub and enable Pages', priority: 'high', due: fmt(today), board: 'b1', tags: ['dev','urgent'], done: false, subtasks: [{id:'s1',text:'Create repo',done:true},{id:'s2',text:'Push code',done:false}], created: Date.now()-5000 },
            { id: 't2', title: 'Complete final year project', desc: 'Finish the capstone project report', priority: 'high', due: add(3), board: 'b3', tags: ['fyp','school'], done: false, subtasks: [], created: Date.now()-4000 },
            { id: 't3', title: 'Review data structures notes', desc: '', priority: 'medium', due: add(1), board: 'b3', tags: ['study'], done: false, subtasks: [], created: Date.now()-3000 },
            { id: 't4', title: 'Update LinkedIn profile', desc: 'Add recent projects and skills', priority: 'low', due: add(7), board: 'b1', tags: ['career'], done: false, subtasks: [], created: Date.now()-2000 },
            { id: 't5', title: 'Buy groceries', desc: 'Milk, eggs, bread, coffee', priority: 'medium', due: fmt(today), board: 'b1', tags: ['personal'], done: true, subtasks: [], created: Date.now()-1000 },
            { id: 't6', title: 'Submit internship application', desc: '', priority: 'high', due: add(2), board: 'b2', tags: ['career','urgent'], done: false, subtasks: [], created: Date.now() },
        ];
        saveTasks(tasks);
        state.currentUser = null;
    }
}

function handleLogin() {
    const username = $('loginUser').value.trim();
    const password = $('loginPass').value;
    $('loginErr').textContent = '';

    if (!username || !password) { showErr('loginErr', 'Please fill in all fields.'); return; }

    const users = getUsers();
    const user = users.find(u => u.username === username && u.hash === hashPw(password));
    if (!user) { showErr('loginErr', 'Incorrect username or password.'); return; }

    loginUser(user);
}

function handleRegister() {
    const name = $('regName').value.trim();
    const username = $('regUser').value.trim();
    const password = $('regPass').value;
    $('regErr').textContent = '';

    if (!name || !username || !password) { showErr('regErr', 'Please fill in all fields.'); return; }
    if (username.length < 3) { showErr('regErr', 'Username must be at least 3 characters.'); return; }
    if (password.length < 6) { showErr('regErr', 'Password must be at least 6 characters.'); return; }

    const users = getUsers();
    if (users.find(u => u.username === username)) { showErr('regErr', 'Username already taken.'); return; }

    const user = { id: 'u_' + Date.now(), username, name, hash: hashPw(password) };
    users.push(user);
    saveUsers(users);

    // seed default boards
    state.currentUser = user;
    saveBoards([
        { id: 'b_' + Date.now(), name: 'Personal', color: '#00C896' },
        { id: 'b_' + (Date.now()+1), name: 'Work', color: '#3B82F6' },
    ]);
    state.currentUser = null;

    loginUser(user);
    showToast('🎉 Account created! Welcome, ' + name + '!');
}

function loginUser(user) {
    state.currentUser = user;
    localStorage.setItem('tf_session', JSON.stringify(user));
    showApp();
}

function handleLogout() {
    state.currentUser = null;
    localStorage.removeItem('tf_session');
    state = { ...state, filter: 'all', activeBoard: null, activeTag: null, searchQuery: '', editingTaskId: null, tempSubtasks: [] };
    $('appScreen').classList.add('hidden');
    $('authScreen').classList.remove('hidden');
    $('loginUser').value = '';
    $('loginPass').value = '';
    showToast('👋 Signed out successfully.');
}

function showErr(id, msg) {
    $(id).textContent = msg;
    $(id).style.animation = 'none';
    requestAnimationFrame(() => { $(id).style.animation = ''; });
}

// ── App Init ───────────────────────────────────────────────
function showApp() {
    $('authScreen').classList.add('hidden');
    $('appScreen').classList.remove('hidden');

    const u = state.currentUser;
    $('userAvatar').textContent = (u.name || u.username)[0].toUpperCase();
    $('userName').textContent = u.name || u.username;

    if (getDark()) document.body.classList.add('dark-mode');
    applyThemeIcon();

    renderSidebar();
    renderTasks();
}

// ── Sidebar ────────────────────────────────────────────────
function renderSidebar() {
    renderBoards();
    renderTags();
    updateCounts();
}

function renderBoards() {
    const boards = getBoards();
    const tasks = getTasks();
    $('boardsList').innerHTML = boards.map(b => {
        const count = tasks.filter(t => t.board === b.id && !t.done).length;
        return `
        <div class="board-item ${state.activeBoard === b.id ? 'active' : ''}" onclick="setBoard('${b.id}')">
            <div class="board-dot" style="background:${b.color}"></div>
            <span class="board-name">${escHtml(b.name)}</span>
            <span class="board-count">${count}</span>
            <button class="board-del" onclick="deleteBoard(event,'${b.id}')">×</button>
        </div>`;
    }).join('');
}

function renderTags() {
    const tasks = getTasks();
    const allTags = [...new Set(tasks.flatMap(t => t.tags))].filter(Boolean);
    $('tagsList').innerHTML = allTags.map(tag =>
        `<span class="tag-pill ${state.activeTag === tag ? 'active' : ''}" onclick="setTagFilter('${escHtml(tag)}')">#${escHtml(tag)}</span>`
    ).join('');
}

function updateCounts() {
    const tasks = getTasks();
    const today = todayStr();
    $('cAll').textContent      = tasks.filter(t => !t.done).length;
    $('cToday').textContent    = tasks.filter(t => !t.done && t.due === today).length;
    $('cUpcoming').textContent = tasks.filter(t => !t.done && t.due > today).length;
    $('cDone').textContent     = tasks.filter(t => t.done).length;
    $('cHigh').textContent     = tasks.filter(t => !t.done && t.priority === 'high').length;
}

// ── Filters ────────────────────────────────────────────────
function setFilter(filter, el) {
    state.filter = filter;
    state.activeBoard = null;
    state.activeTag = null;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (el) el.classList.add('active');

    const titles = { all: 'All Tasks', today: 'Today', upcoming: 'Upcoming', completed: 'Completed', high: 'High Priority' };
    $('viewTitle').textContent = titles[filter] || 'Tasks';
    renderBoards();
    renderTasks();
}

function setBoard(boardId) {
    state.activeBoard = boardId;
    state.activeTag = null;
    state.filter = 'board';
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const boards = getBoards();
    const board = boards.find(b => b.id === boardId);
    $('viewTitle').textContent = board ? board.name : 'Board';
    renderBoards();
    renderTasks();
}

function setTagFilter(tag) {
    if (state.activeTag === tag) {
        state.activeTag = null;
        state.filter = 'all';
        setFilter('all', document.querySelector('.nav-item'));
    } else {
        state.activeTag = tag;
        state.filter = 'tag';
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        $('viewTitle').textContent = '#' + tag;
    }
    renderTags();
    renderTasks();
}

function handleSearch(val) {
    state.searchQuery = val.toLowerCase();
    renderTasks();
}

// ── Task Rendering ─────────────────────────────────────────
function getFilteredTasks() {
    let tasks = getTasks();
    const today = todayStr();

    // filter
    switch (state.filter) {
        case 'today':     tasks = tasks.filter(t => t.due === today && !t.done); break;
        case 'upcoming':  tasks = tasks.filter(t => t.due > today && !t.done); break;
        case 'completed': tasks = tasks.filter(t => t.done); break;
        case 'high':      tasks = tasks.filter(t => t.priority === 'high' && !t.done); break;
        case 'board':     tasks = tasks.filter(t => t.board === state.activeBoard); break;
        case 'tag':       tasks = tasks.filter(t => t.tags.includes(state.activeTag)); break;
    }

    // search
    if (state.searchQuery) {
        tasks = tasks.filter(t =>
            t.title.toLowerCase().includes(state.searchQuery) ||
            t.desc.toLowerCase().includes(state.searchQuery) ||
            t.tags.some(g => g.toLowerCase().includes(state.searchQuery))
        );
    }

    // sort
    const sort = $('sortSelect').value;
    tasks.sort((a, b) => {
        if (sort === 'due') {
            if (!a.due && !b.due) return 0;
            if (!a.due) return 1;
            if (!b.due) return -1;
            return a.due.localeCompare(b.due);
        }
        if (sort === 'priority') {
            const p = { high: 0, medium: 1, low: 2 };
            return p[a.priority] - p[b.priority];
        }
        if (sort === 'alpha') return a.title.localeCompare(b.title);
        return b.created - a.created;
    });

    return tasks;
}

function renderTasks() {
    const tasks = getFilteredTasks();
    const list = $('taskList');
    const empty = $('emptyState');

    updateCounts();
    updateProgress();
    $('taskCountBadge').textContent = tasks.length + (tasks.length === 1 ? ' task' : ' tasks');

    if (tasks.length === 0) {
        list.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }
    empty.classList.add('hidden');

    // apply view
    list.className = 'task-list' + (state.viewMode === 'grid' ? ' grid-view' : '');

    list.innerHTML = tasks.map(t => renderTaskCard(t)).join('');
}

function renderTaskCard(t) {
    const today = todayStr();
    const doneClass = t.done ? 'done' : '';
    const prioClass = `p-${t.priority}`;

    // due date label
    let dueHtml = '';
    if (t.due) {
        let cls = 'meta-due';
        let label = '📅 ' + formatDate(t.due);
        if (!t.done && t.due < today) { cls += ' overdue'; label = '⚠️ Overdue · ' + formatDate(t.due); }
        else if (!t.done && t.due === today) { cls += ' soon'; label = '☀️ Today'; }
        else if (!t.done && t.due === addDays(1)) { cls += ' soon'; label = '🌅 Tomorrow'; }
        dueHtml = `<span class="${cls}">${label}</span>`;
    }

    // tags
    const tagsHtml = t.tags.map(g => `<span class="meta-tag">#${escHtml(g)}</span>`).join('');

    // subtasks
    let subtaskHtml = '';
    if (t.subtasks && t.subtasks.length > 0) {
        const done = t.subtasks.filter(s => s.done).length;
        const pct = Math.round((done / t.subtasks.length) * 100);
        subtaskHtml = `
            <div class="subtask-bar">
                <div class="subtask-progress">${done}/${t.subtasks.length} subtasks</div>
                <div class="subtask-track"><div class="subtask-fill" style="width:${pct}%"></div></div>
            </div>`;
    }

    const boards = getBoards();
    const board = boards.find(b => b.id === t.board);
    const boardDot = board ? `<span class="meta-tag" style="border-color:${board.color};color:${board.color}">◉ ${escHtml(board.name)}</span>` : '';

    return `
    <div class="task-card ${doneClass} ${prioClass}" id="card_${t.id}" draggable="true"
         ondragstart="dragStart(event,'${t.id}')" ondragover="dragOver(event)" ondrop="drop(event,'${t.id}')">
        <div class="task-check ${t.done ? 'checked' : ''}" onclick="toggleDone('${t.id}')"></div>
        <div class="task-body" onclick="openEditModal('${t.id}')">
            <div class="task-title">${escHtml(t.title)}</div>
            ${t.desc ? `<div class="task-desc">${escHtml(t.desc)}</div>` : ''}
            <div class="task-meta">
                <span class="priority-badge ${t.priority}">${t.priority}</span>
                ${dueHtml}
                ${boardDot}
                ${tagsHtml}
            </div>
            ${subtaskHtml}
        </div>
        <div class="task-actions">
            <button class="task-action-btn" onclick="openEditModal('${t.id}')" title="Edit">✏️</button>
            <button class="task-action-btn del" onclick="deleteTask(event,'${t.id}')" title="Delete">🗑</button>
        </div>
    </div>`;
}

function updateProgress() {
    const tasks = getTasks();
    const total = tasks.length;
    const done = tasks.filter(t => t.done).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    $('progressLabel').textContent = `${done} of ${total} completed`;
    $('progressPct').textContent = pct + '%';
    $('progressFill').style.width = pct + '%';
}

// ── Task CRUD ──────────────────────────────────────────────
function handleQuickAdd(e) {
    if (e.key !== 'Enter') return;
    const input = $('quickInput');
    const text = input.value.trim();
    if (!text) return;

    const task = {
        id: 't_' + Date.now(),
        title: text,
        desc: '',
        priority: 'medium',
        due: '',
        board: getBoards()[0]?.id || '',
        tags: [],
        done: false,
        subtasks: [],
        created: Date.now(),
    };
    const tasks = getTasks();
    tasks.unshift(task);
    saveTasks(tasks);
    input.value = '';
    renderTasks();
    renderSidebar();
    showToast('✅ Task added!');
}

function toggleDone(id) {
    const tasks = getTasks();
    const t = tasks.find(t => t.id === id);
    if (!t) return;
    t.done = !t.done;
    saveTasks(tasks);

    const card = $('card_' + id);
    if (card) {
        card.classList.add(t.done ? 'completing' : '');
        setTimeout(() => { renderTasks(); renderSidebar(); }, t.done ? 350 : 0);
    } else {
        renderTasks();
        renderSidebar();
    }
    showToast(t.done ? '🎉 Task completed!' : '↩ Task reopened.');
}

function deleteTask(e, id) {
    e.stopPropagation();
    const card = $('card_' + id);
    if (card) {
        card.classList.add('exiting');
        setTimeout(() => {
            const tasks = getTasks().filter(t => t.id !== id);
            saveTasks(tasks);
            renderTasks();
            renderSidebar();
        }, 250);
    }
    showToast('🗑 Task deleted.', 'error');
}

// ── Task Modal ─────────────────────────────────────────────
function openTaskModal() {
    state.editingTaskId = null;
    state.tempSubtasks = [];
    $('modalHeading').textContent = 'Add Task';
    $('mSubmit').textContent = 'Add Task';
    $('mTitle').value = '';
    $('mDesc').value = '';
    $('mPriority').value = 'medium';
    $('mDue').value = '';
    $('mTags').value = '';
    populateBoardSelect();
    renderSubtaskList();
    $('taskModal').classList.remove('hidden');
    setTimeout(() => $('mTitle').focus(), 100);
}

function openEditModal(id) {
    const tasks = getTasks();
    const t = tasks.find(t => t.id === id);
    if (!t) return;

    state.editingTaskId = id;
    state.tempSubtasks = [...(t.subtasks || [])];
    $('modalHeading').textContent = 'Edit Task';
    $('mSubmit').textContent = 'Save Changes';
    $('mTitle').value = t.title;
    $('mDesc').value = t.desc;
    $('mPriority').value = t.priority;
    $('mDue').value = t.due;
    $('mTags').value = t.tags.join(', ');
    populateBoardSelect(t.board);
    renderSubtaskList();
    $('taskModal').classList.remove('hidden');
    setTimeout(() => $('mTitle').focus(), 100);
}

function closeTaskModal() {
    $('taskModal').classList.add('hidden');
    state.editingTaskId = null;
    state.tempSubtasks = [];
}

function submitTask() {
    const title = $('mTitle').value.trim();
    if (!title) { $('mTitle').focus(); $('mTitle').style.borderColor = 'var(--red)'; return; }
    $('mTitle').style.borderColor = '';

    const tags = $('mTags').value.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

    if (state.editingTaskId) {
        const tasks = getTasks();
        const t = tasks.find(t => t.id === state.editingTaskId);
        if (t) {
            t.title = title;
            t.desc = $('mDesc').value.trim();
            t.priority = $('mPriority').value;
            t.due = $('mDue').value;
            t.board = $('mBoard').value;
            t.tags = tags;
            t.subtasks = state.tempSubtasks;
            saveTasks(tasks);
            showToast('✏️ Task updated!');
        }
    } else {
        const task = {
            id: 't_' + Date.now(),
            title,
            desc: $('mDesc').value.trim(),
            priority: $('mPriority').value,
            due: $('mDue').value,
            board: $('mBoard').value,
            tags,
            done: false,
            subtasks: state.tempSubtasks,
            created: Date.now(),
        };
        const tasks = getTasks();
        tasks.unshift(task);
        saveTasks(tasks);
        showToast('✅ Task added!');
    }

    closeTaskModal();
    renderTasks();
    renderSidebar();
}

function populateBoardSelect(selected) {
    const boards = getBoards();
    $('mBoard').innerHTML = boards.map(b =>
        `<option value="${b.id}" ${b.id === selected ? 'selected' : ''}>${escHtml(b.name)}</option>`
    ).join('');
}

// ── Subtasks ───────────────────────────────────────────────
function renderSubtaskList() {
    $('subtaskList').innerHTML = state.tempSubtasks.map((s, i) => `
        <div class="subtask-item">
            <input type="checkbox" ${s.done ? 'checked' : ''} onchange="toggleSubtask(${i})">
            <span>${escHtml(s.text)}</span>
            <button onclick="removeSubtask(${i})">×</button>
        </div>`
    ).join('');
}

function addSubtask() {
    const input = $('subtaskInput');
    const text = input.value.trim();
    if (!text) return;
    state.tempSubtasks.push({ id: 's_' + Date.now(), text, done: false });
    input.value = '';
    renderSubtaskList();
}

function toggleSubtask(i) {
    state.tempSubtasks[i].done = !state.tempSubtasks[i].done;
    renderSubtaskList();
}

function removeSubtask(i) {
    state.tempSubtasks.splice(i, 1);
    renderSubtaskList();
}

// ── Board Modal ────────────────────────────────────────────
function openBoardModal() {
    $('boardName').value = '';
    state.selectedColor = '#00C896';
    document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
    document.querySelector('.color-dot').classList.add('selected');
    $('boardModal').classList.remove('hidden');
    setTimeout(() => $('boardName').focus(), 100);
}

function closeBoardModal() { $('boardModal').classList.add('hidden'); }

function pickColor(el) {
    document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
    el.classList.add('selected');
    state.selectedColor = el.dataset.color;
}

function submitBoard() {
    const name = $('boardName').value.trim();
    if (!name) { $('boardName').focus(); return; }
    const board = { id: 'b_' + Date.now(), name, color: state.selectedColor };
    const boards = getBoards();
    boards.push(board);
    saveBoards(boards);
    closeBoardModal();
    renderSidebar();
    showToast('📁 Board "' + name + '" created!');
}

function deleteBoard(e, id) {
    e.stopPropagation();
    const boards = getBoards().filter(b => b.id !== id);
    saveBoards(boards);
    if (state.activeBoard === id) { state.activeBoard = null; state.filter = 'all'; }
    renderSidebar();
    renderTasks();
    showToast('🗑 Board deleted.', 'error');
}

// ── Drag & Drop ────────────────────────────────────────────
let dragId = null;

function dragStart(e, id) {
    dragId = id;
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => { const el = $('card_' + id); if (el) el.style.opacity = '0.4'; }, 0);
}

function dragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function drop(e, targetId) {
    e.preventDefault();
    if (dragId === targetId) return;
    const tasks = getTasks();
    const fromIdx = tasks.findIndex(t => t.id === dragId);
    const toIdx   = tasks.findIndex(t => t.id === targetId);
    if (fromIdx < 0 || toIdx < 0) return;
    const [moved] = tasks.splice(fromIdx, 1);
    tasks.splice(toIdx, 0, moved);
    saveTasks(tasks);
    dragId = null;
    renderTasks();
}

// ── UI Helpers ─────────────────────────────────────────────
function toggleSidebar() {
    const sb = $('sidebar');
    const main = document.querySelector('.main-content');
    if (window.innerWidth <= 768) {
        sb.classList.toggle('open');
    } else {
        sb.classList.toggle('collapsed');
        main.classList.toggle('expanded');
    }
}

function setView(v) {
    state.viewMode = v;
    $('btnList').classList.toggle('active', v === 'list');
    $('btnGrid').classList.toggle('active', v === 'grid');
    renderTasks();
}

function toggleDark() {
    document.body.classList.toggle('dark-mode');
    setDark(document.body.classList.contains('dark-mode'));
    applyThemeIcon();
}

function applyThemeIcon() {
    $('themeBtn').textContent = getDark() ? '☀️' : '🌙';
}

function togglePw(inputId, btn) {
    const inp = $(inputId);
    if (inp.type === 'password') { inp.type = 'text'; btn.textContent = '🙈'; }
    else { inp.type = 'password'; btn.textContent = '👁'; }
}

function switchTab(tab) {
    const isLogin = tab === 'login';
    $('loginForm').classList.toggle('hidden', !isLogin);
    $('registerForm').classList.toggle('hidden', isLogin);
    $('tabLogin').classList.toggle('active', isLogin);
    $('tabRegister').classList.toggle('active', !isLogin);
    $('tabSlider').classList.toggle('right', !isLogin);
    $('loginErr').textContent = '';
    $('regErr').textContent = '';
}

function showToast(msg, type = 'success') {
    const c = $('toastContainer');
    const t = document.createElement('div');
    t.className = `toast ${type !== 'success' ? type : ''}`;
    
    // Added style="flex: 1;" to the span to keep it from squishing the button
    // And we are using &times; which is the official HTML code for a perfect "X"
    t.innerHTML = `
        <span style="flex: 1;">${msg}</span>
        <button class="toast-close" style="font-size: 18px; margin-left: 10px;" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    c.appendChild(t);
    
    setTimeout(() => {
        if (t.parentElement) {
            t.style.animation = 'toastOut 0.3s ease forwards';
            setTimeout(() => t.remove(), 300);
        }
    }, 2800);
}

// ── Utilities ──────────────────────────────────────────────
function $(id) { return document.getElementById(id); }
function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function todayStr() { return new Date().toISOString().split('T')[0]; }
function addDays(n) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
}
function formatDate(str) {
    if (!str) return '';
    const [y, m, d] = str.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${parseInt(d)} ${months[parseInt(m)-1]}`;
}

// ── Keyboard shortcuts ─────────────────────────────────────
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeTaskModal();
        closeBoardModal();
    }
    // Ctrl/Cmd + K  → focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const si = $('searchInput');
        if (si) si.focus();
    }
    // Ctrl/Cmd + N → new task modal
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        if ($('appScreen') && !$('appScreen').classList.contains('hidden')) {
            e.preventDefault();
            openTaskModal();
        }
    }
});

// ── Bootstrap ──────────────────────────────────────────────
initDemo();

// check persisted session
const saved = localStorage.getItem('tf_session');
if (saved) {
    try {
        const u = JSON.parse(saved);
        const users = getUsers();
        if (users.find(x => x.id === u.id)) {
            state.currentUser = u;
            showApp();
        }
    } catch(_) {}
}
