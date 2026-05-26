import { useApp } from '../../context/AppContext';
import './Toast.css';

export default function Toast() {
  const { toasts, removeToast } = useApp();

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type !== 'success' ? t.type : ''}`}>
          <span style={{ flex: 1 }}>{t.message}</span>
          <button className="toast-close" onClick={() => removeToast(t.id)}>&times;</button>
        </div>
      ))}
    </div>
  );
}
