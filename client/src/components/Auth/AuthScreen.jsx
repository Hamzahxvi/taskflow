import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './AuthScreen.css';

export default function AuthScreen() {
  const [tab, setTab] = useState('login');
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [regName, setRegName] = useState('');
  const [regUser, setRegUser] = useState('');
  const [regPass, setRegPass] = useState('');
  const [error, setError] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showRegPw, setShowRegPw] = useState(false);

  const { loginUser: doLogin, registerUser: doRegister } = useApp();

  useEffect(() => { setError(''); }, [tab]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginUser.trim() || !loginPass) {
      setError('Please fill in all fields.'); return;
    }
    try {
      await doLogin(loginUser.trim(), loginPass);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regUser.trim() || !regPass) {
      setError('Please fill in all fields.'); return;
    }
    if (regUser.trim().length < 3) {
      setError('Username must be at least 3 characters.'); return;
    }
    if (regPass.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    try {
      await doRegister(regName.trim(), regUser.trim(), regPass);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="brand-mark">✦</div>
          <h1 className="brand-name">TaskFlow</h1>
          <p className="brand-tagline">Your thoughts, organized beautifully.</p>
        </div>
        <div className="auth-floats">
          <div className="float-card fc-1">
            <span className="fc-icon">📌</span><span>Design system review</span><span className="fc-badge high">High</span>
          </div>
          <div className="float-card fc-2">
            <span className="fc-icon">🚀</span><span>Deploy to production</span><span className="fc-badge med">Medium</span>
          </div>
          <div className="float-card fc-3 done">
            <span className="fc-icon">✅</span><span>User research done</span><span className="fc-badge low">Low</span>
          </div>
          <div className="float-card fc-4">
            <span className="fc-icon">📖</span><span>Study algorithms</span><span className="fc-badge high">High</span>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-box">
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Sign In</button>
            <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Register</button>
            <div className={`tab-slider ${tab === 'register' ? 'right' : ''}`} />
          </div>

          {tab === 'login' ? (
            <form className="auth-form" onSubmit={handleLogin}>
              <h2>Welcome back</h2>
              <p className="auth-sub">Continue where you left off.</p>
              <div className="form-group">
                <label>Username</label>
                <input type="text" value={loginUser} onChange={e => setLoginUser(e.target.value)} placeholder="Enter username" autoComplete="username" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="input-wrap">
                  <input type={showLoginPw ? 'text' : 'password'} value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Enter password" autoComplete="current-password" />
                  <button type="button" className="eye-btn" onClick={() => setShowLoginPw(!showLoginPw)}>{showLoginPw ? '🙈' : '👁'}</button>
                </div>
              </div>
              {error && <div className="auth-error">{error}</div>}
              <button type="submit" className="btn-primary btn-full">Sign In →</button>
              <p className="auth-demo">Try demo: <strong>demo</strong> / <strong>demo123</strong></p>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegister}>
              <h2>Create account</h2>
              <p className="auth-sub">Start your organised life today.</p>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input type="text" value={regUser} onChange={e => setRegUser(e.target.value)} placeholder="Choose a username" autoComplete="username" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="input-wrap">
                  <input type={showRegPw ? 'text' : 'password'} value={regPass} onChange={e => setRegPass(e.target.value)} placeholder="Choose a password" autoComplete="new-password" />
                  <button type="button" className="eye-btn" onClick={() => setShowRegPw(!showRegPw)}>{showRegPw ? '🙈' : '👁'}</button>
                </div>
              </div>
              {error && <div className="auth-error">{error}</div>}
              <button type="submit" className="btn-primary btn-full">Create Account →</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
