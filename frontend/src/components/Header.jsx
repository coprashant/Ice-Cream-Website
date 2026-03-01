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
// Edit Profile Modal
// Reuses the same auth-overlay/auth-modal CSS — no new classes needed.
// ─────────────────────────────────────────────
const EditProfileModal = ({ currentUser, onClose, onSave }) => {
  const biz = currentUser?.business_details;
  const [form,    setForm]    = useState({
    name:           biz?.name           || '',
    contact_person: biz?.contact_person || '',
    phone:          biz?.phone          || '',
    email:          biz?.email          || '',
    address:        biz?.address        || '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const overlayRef = useRef(null);

  const update = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`${API_BASE}/auth/me/update`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': currentUser.id },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) { onSave(data); onClose(); }
      else setError(data.error || 'Update failed.');
    } catch {
      setError('Cannot reach server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-overlay"
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="auth-modal">
        <button className="auth-modal-close" onClick={onClose}>✕</button>

        <h2 className="edit-profile-title">✏️ Edit Business Profile</h2>

        <form className="auth-form" onSubmit={handleSave}>
          <div className="auth-field">
            <label>Business Name *</label>
            <input type="text" required value={form.name} onChange={update('name')}
              placeholder="Your business name" />
          </div>
          <div className="auth-grid">
            <div className="auth-field">
              <label>Contact Person</label>
              <input type="text" value={form.contact_person} onChange={update('contact_person')}
                placeholder="Your full name" />
            </div>
            <div className="auth-field">
              <label>Phone</label>
              <input type="tel" value={form.phone} onChange={update('phone')}
                placeholder="98XXXXXXXX" />
            </div>
            <div className="auth-field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={update('email')}
                placeholder="business@email.com" />
            </div>
            <div className="auth-field">
              <label>Address</label>
              <input type="text" value={form.address} onChange={update('address')}
                placeholder="Street, Ward, City" />
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <div className="edit-profile-actions">
            <button type="button" className="edit-profile-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="auth-submit edit-profile-submit" disabled={loading}>
              {loading ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// User dropdown (shown when logged in)
// ─────────────────────────────────────────────
const UserDropdown = ({ currentUser, onNavigate, onLogout, onEditProfile }) => {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const label = currentUser.business_details?.contact_person || currentUser.username;
  const go    = (fn) => () => { fn(); setOpen(false); };

  return (
    <div className="user-dropdown-wrap" ref={ref}>
      <button className="user-dropdown-btn" onClick={() => setOpen(o => !o)}>
        <span className="user-avatar">👤</span>
        <span className="user-label">{label}</span>
        <span className={`user-caret${open ? ' open' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="user-dropdown-menu">
          {/* Business name context row */}
          {currentUser.business_details?.name && (
            <div className="dropdown-context">
              <span>🏢</span>
              <span className="dropdown-context-label">
                {currentUser.business_details.name}
              </span>
            </div>
          )}

          {/* Dashboard — only shown in dropdown on mobile (desktop has dedicated button) */}
          <button className="desktop-hide" onClick={go(() => onNavigate('dashboard'))}>
            📊 Dashboard
          </button>

          <button onClick={go(() => onNavigate('order'))}>
            🛒 Place Order
          </button>

          <button onClick={go(onEditProfile)}>
            ✏️ Edit Profile
          </button>

          <div className="dropdown-divider" />

          <button className="dropdown-logout" onClick={go(onLogout)}>
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
const Header = ({ activePage, setActivePage, currentUser, onLogin, onLogout, onProfileUpdate }) => {
  const { isDark, toggleTheme } = useTheme();
  const [scrolled,     setScrolled]     = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [showAuth,     setShowAuth]     = useState(false);
  const [showEditProf, setShowEditProf] = useState(false);

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
                <button className="nav-btn" onClick={() => { setShowEditProf(true); setMenuOpen(false); }}>
                  <span className="nav-icon">✏️</span> EDIT PROFILE
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

          {/* Dashboard button — desktop only */}
          {currentUser && (
            <button
              className={`nav-btn desktop-dashboard-btn${activePage === 'dashboard' ? ' active' : ''}`}
              onClick={() => navTo('dashboard')}
            >
              <span className="nav-icon">📊</span>
              DASHBOARD
            </button>
          )}

          {/* Desktop auth */}
          <div className="desktop-auth">
            {currentUser ? (
              <UserDropdown
                currentUser={currentUser}
                onNavigate={navTo}
                onLogout={onLogout}
                onEditProfile={() => setShowEditProf(true)}
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

      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onLogin={onLogin} />
      )}

      {showEditProf && currentUser && (
        <EditProfileModal
          currentUser={currentUser}
          onClose={() => setShowEditProf(false)}
          onSave={(updatedUser) => {
            onProfileUpdate?.(updatedUser);
            setShowEditProf(false);
          }}
        />
      )}
    </>
  );
};

export default Header;