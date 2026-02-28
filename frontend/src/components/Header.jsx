import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import './Header.css';

const API_BASE = 'http://localhost:8000/api';

// ─────────────────────────────────────────────
// Auth Modal — Login / Register
// ─────────────────────────────────────────────
const AuthModal = ({ onClose, onLogin }) => {
  const [screen,      setScreen]  = useState('login');
  const [loginForm,   setLogin]   = useState({ username: '', password: '' });
  const [regForm,     setReg]     = useState({
    username: '', password: '', business_name: '',
    contact_person: '', phone: '', email: '', address: '',
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const overlayRef = useRef(null);

  // Close on backdrop click
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`${API_BASE}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data);
        onClose();
      } else {
        setError(data.error || 'Login failed.');
      }
    } catch {
      setError('Cannot reach server.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`${API_BASE}/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(regForm),
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data);
        onClose();
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch {
      setError('Cannot reach server.');
    } finally {
      setLoading(false);
    }
  };

  const updateReg = (field) => (e) => setReg(p => ({ ...p, [field]: e.target.value }));

  return (
    <div className="auth-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="auth-modal">
        <button className="auth-modal-close" onClick={onClose}>✕</button>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab${screen === 'login' ? ' active' : ''}`}
            onClick={() => { setScreen('login'); setError(''); }}
          >Sign In</button>
          <button
            className={`auth-tab${screen === 'register' ? ' active' : ''}`}
            onClick={() => { setScreen('register'); setError(''); }}
          >Register</button>
        </div>

        {/* Login */}
        {screen === 'login' && (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-field">
              <label>Username</label>
              <input type="text" placeholder="Your username" required
                value={loginForm.username}
                onChange={e => setLogin(p => ({ ...p, username: e.target.value }))} />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <input type="password" placeholder="Your password" required
                value={loginForm.password}
                onChange={e => setLogin(p => ({ ...p, password: e.target.value }))} />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? '⏳ Signing in...' : 'Sign In →'}
            </button>
            <p className="auth-switch">
              New business?{' '}
              <button type="button" onClick={() => { setScreen('register'); setError(''); }}>
                Register here
              </button>
            </p>
          </form>
        )}

        {/* Register */}
        {screen === 'register' && (
          <form className="auth-form" onSubmit={handleRegister}>
            <p className="auth-section-label">Account</p>
            <div className="auth-grid">
              <div className="auth-field">
                <label>Username *</label>
                <input type="text" placeholder="Choose a username" required
                  value={regForm.username} onChange={updateReg('username')} />
              </div>
              <div className="auth-field">
                <label>Password *</label>
                <input type="password" placeholder="Min. 8 characters" required minLength={8}
                  value={regForm.password} onChange={updateReg('password')} />
              </div>
            </div>

            <p className="auth-section-label">Business Details</p>
            <div className="auth-field">
              <label>Business Name *</label>
              <input type="text" placeholder="Your business name" required
                value={regForm.business_name} onChange={updateReg('business_name')} />
            </div>
            <div className="auth-grid">
              <div className="auth-field">
                <label>Contact Person</label>
                <input type="text" placeholder="Your full name"
                  value={regForm.contact_person} onChange={updateReg('contact_person')} />
              </div>
              <div className="auth-field">
                <label>Phone</label>
                <input type="tel" placeholder="98XXXXXXXX"
                  value={regForm.phone} onChange={updateReg('phone')} />
              </div>
              <div className="auth-field">
                <label>Email</label>
                <input type="email" placeholder="business@email.com"
                  value={regForm.email} onChange={updateReg('email')} />
              </div>
              <div className="auth-field">
                <label>Address</label>
                <input type="text" placeholder="Street, Ward, City"
                  value={regForm.address} onChange={updateReg('address')} />
              </div>
            </div>

            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? '⏳ Creating account...' : '✅ Create Account →'}
            </button>
            <p className="auth-switch">
              Already registered?{' '}
              <button type="button" onClick={() => { setScreen('login'); setError(''); }}>
                Sign in here
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// User dropdown (shown when logged in)
// ─────────────────────────────────────────────
const UserDropdown = ({ currentUser, onNavigate, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const label = currentUser.business_details?.contact_person
    || currentUser.username;

  return (
    <div className="user-dropdown-wrap" ref={ref}>
      <button className="user-dropdown-btn" onClick={() => setOpen(o => !o)}>
        <span className="user-avatar">👤</span>
        <span className="user-label">{label}</span>
        <span className={`user-caret${open ? ' open' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="user-dropdown-menu">
          <button onClick={() => { onNavigate('dashboard'); setOpen(false); }}>
            📊 Dashboard
          </button>
          <button onClick={() => { onNavigate('order'); setOpen(false); }}>
            🛒 Place Order
          </button>
          <div className="dropdown-divider" />
          <button className="dropdown-logout" onClick={() => { onLogout(); setOpen(false); }}>
            🚪 Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────
const Header = ({ activePage, setActivePage, currentUser, onLogin, onLogout }) => {
  const { isDark, toggleTheme } = useTheme();
  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [showAuth,   setShowAuth]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navTo = (page) => {
    setActivePage(page);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navPages = [
    { id: 'home',    icon: '🏠', label: 'HOME' },
    { id: 'order',   icon: '🛒', label: 'ORDER' },
    { id: 'contact', icon: '📞', label: 'CONTACT' },
  ];

  return (
    <>
      <header className={`header${scrolled ? ' shrink' : ''}`}>
        {/* Logo */}
        <div className="header-left" onClick={() => navTo('home')} style={{ cursor: 'pointer' }}>
          <div className="logo-mark">
            <img className="logo-icon" src="/logo.png" alt="Logo" />
          </div>
          <div className="brand-name">
            <span className="brand-line1">Sheetal</span>
            <span className="brand-line2">Ice Cream</span>
          </div>
        </div>

        {/* Centre nav — desktop */}
        <nav className={`nav-center${menuOpen ? ' open' : ''}`}>
          {navPages.map(({ id, icon, label }) => (
            <button
              key={id}
              className={`nav-btn${activePage === id ? ' active' : ''}`}
              onClick={() => navTo(id)}
            >
              <span className="nav-icon">{icon}</span>
              {label}
            </button>
          ))}

          {/* Mobile-only: auth buttons inside hamburger menu */}
          <div className="mobile-auth-section">
            {currentUser ? (
              <>
                <button className="nav-btn" onClick={() => navTo('dashboard')}>
                  <span className="nav-icon">📊</span> DASHBOARD
                </button>
                <button className="nav-btn nav-logout" onClick={() => { onLogout(); setMenuOpen(false); }}>
                  <span className="nav-icon">🚪</span> SIGN OUT
                </button>
              </>
            ) : (
              <button className="nav-btn nav-login-mobile" onClick={() => { setShowAuth(true); setMenuOpen(false); }}>
                <span className="nav-icon">👤</span> LOGIN / REGISTER
              </button>
            )}
          </div>
        </nav>

        {/* Right controls */}
        <div className="header-right-controls">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Desktop auth */}
          <div className="desktop-auth">
            {currentUser ? (
              <UserDropdown
                currentUser={currentUser}
                onNavigate={navTo}
                onLogout={onLogout}
              />
            ) : (
              <button className="auth-btn" onClick={() => setShowAuth(true)}>
                👤 Login / Register
              </button>
            )}
          </div>

          {/* Hamburger — mobile */}
          <button
            className={`hamburger${menuOpen ? ' active' : ''}`}
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* Auth modal */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={onLogin}
        />
      )}
    </>
  );
};

export default Header;