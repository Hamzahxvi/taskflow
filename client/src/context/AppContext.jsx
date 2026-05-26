import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../api/client';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('tf_dark') === '1');
  const [toasts, setToasts] = useState([]);

  // Filters & UI state
  const [filter, setFilter] = useState('all');
  const [activeBoard, setActiveBoard] = useState(null);
  const [activeTag, setActiveTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('created');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Auth
  const loginUser = async (username, password) => {
    const { data } = await api.login(username, password);
    localStorage.setItem('tf_token', data.token);
    localStorage.setItem('tf_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const registerUser = async (name, username, password) => {
    const { data } = await api.register(name, username, password);
    localStorage.setItem('tf_token', data.token);
    localStorage.setItem('tf_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('tf_token');
    localStorage.removeItem('tf_user');
    setUser(null);
    setTasks([]);
    setBoards([]);
    setFilter('all');
    setActiveBoard(null);
    setActiveTag(null);
    setSearchQuery('');
  };

  // Data fetching
  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [tasksRes, boardsRes] = await Promise.all([
        api.getTasks(),
        api.getBoards(),
      ]);
      setTasks(tasksRes.data.tasks);
      setBoards(boardsRes.data.boards);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Task operations
  const addTask = async (taskData) => {
    const { data } = await api.createTask(taskData);
    setTasks(prev => [data.task, ...prev]);
    return data.task;
  };

  const editTask = async (id, taskData) => {
    const { data } = await api.updateTask(id, taskData);
    setTasks(prev => prev.map(t => t.id === id ? data.task : t));
    return data.task;
  };

  const removeTask = async (id) => {
    await api.deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTaskDone = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const updated = await editTask(id, { done: !task.done });
    return updated;
  };

  // Board operations
  const addBoard = async (boardData) => {
    const { data } = await api.createBoard(boardData);
    setBoards(prev => [...prev, data.board]);
  };

  const removeBoard = async (id) => {
    await api.deleteBoard(id);
    setBoards(prev => prev.filter(b => b.id !== id));
    if (activeBoard === id) {
      setActiveBoard(null);
      setFilter('all');
    }
  };

  // Reorder tasks (for drag & drop)
  const reorder = async (reorderedTasks) => {
    const updates = reorderedTasks.map((t, i) => ({ id: t.id, sort_order: reorderedTasks.length - i }));
    await api.reorderTasks(updates);
    setTasks(reorderedTasks);
  };

  // Dark mode
  const toggleDark = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('tf_dark', next ? '1' : '0');
      return next;
    });
  };

  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const value = {
    user, setUser, tasks, setTasks, boards, setBoards, loading,
    darkMode, toggleDark, toasts, addToast, removeToast,
    filter, setFilter, activeBoard, setActiveBoard, activeTag, setActiveTag,
    searchQuery, setSearchQuery, viewMode, setViewMode, sortBy, setSortBy,
    sidebarOpen, setSidebarOpen,
    loginUser, registerUser, logout, fetchData,
    addTask, editTask, removeTask, toggleTaskDone,
    addBoard, removeBoard, reorder,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
