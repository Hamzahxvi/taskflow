import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tf_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('tf_token');
      localStorage.removeItem('tf_user');
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const login = (username, password) => api.post('/auth/login', { username, password });
export const register = (name, username, password) => api.post('/auth/register', { name, username, password });
export const getMe = () => api.get('/auth/me');

// Tasks
export const getTasks = () => api.get('/tasks');
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const reorderTasks = (tasks) => api.put('/tasks/reorder/batch', { tasks });

// Boards
export const getBoards = () => api.get('/boards');
export const createBoard = (data) => api.post('/boards', data);
export const deleteBoard = (id) => api.delete(`/boards/${id}`);
