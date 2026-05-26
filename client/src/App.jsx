import { useEffect } from 'react';
import { useApp, AppProvider } from './context/AppContext';
import AuthScreen from './components/Auth/AuthScreen';
import Sidebar from './components/Layout/Sidebar';
import TaskList from './components/Tasks/TaskList';
import TaskModal from './components/Modals/TaskModal';
import BoardModal from './components/Modals/BoardModal';
import Toast from './components/Common/Toast';
import './index.css';
import './App.css';

function AppInner() {
  const { user, setUser, darkMode } = useApp();

  useEffect(() => {
    const savedUser = localStorage.getItem('tf_user');
    const token = localStorage.getItem('tf_token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        // Modals handle their own close
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const si = document.querySelector('.sidebar-search input');
        if (si) si.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        if (user) {
          e.preventDefault();
          document.getElementById('taskModalTrigger')?.click();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  return (
    <>
      {/* Hidden trigger buttons for modals */}
      <button id="taskModalTrigger" style={{ display: 'none' }} />
      <button id="boardModalTrigger" style={{ display: 'none' }} />

      {!user ? (
        <AuthScreen />
      ) : (
        <div className="app-screen">
          <Sidebar />
          <TaskList />
        </div>
      )}

      <TaskModal triggerId="taskModalTrigger" />
      <BoardModal triggerId="boardModalTrigger" />
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
