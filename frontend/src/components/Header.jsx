import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../api';
import './Header.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const IconUser     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconX        = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconCart     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
const IconPhone    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
const IconHome     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconGrid     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconShield   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconEdit     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconLogout   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconBuilding = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconSun      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const IconMoon     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const IconChevron  = ({ open }) => <svg style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;

const AuthModal = ({ onClose, onLogin }) => {
  const [screen,    setScreen]  = useState('login');
  const [loginForm, setLogin]   = useState({ username: '', password: '' });
  const [regForm,   setReg]     = useState({ username: '', password: '', business_name: '', contact_person: '', phone: '', email: '', address: '' });
  const [error,     setError]   = useState('');
  const [loading,   setLoading] = useState(false);
  const overlayRef = useRef(null);

  const handleOverlayClick = (e) => { if (e.target === overlayRef.current) onClose(); };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginForm) });
      const data = await res.json();
      if (res.ok) { onLogin(data); onClose(); }
      else setError(data.error || 'Login failed.');
    } catch { setError('Cannot reach server.'); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API_BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(regForm) });
      const data = await res.json();
      if (res.ok) { onLogin(data); onClose(); }
      else setError(data.error || 'Registration failed.');
    } catch { setError('Cannot reach server.'); }
    finally { setLoading(false); }
  };

  const updateReg = (field) => (e) => setReg(p => ({ ...p, [field]: e.target.value }));

  return (
    <div className="auth-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="auth-modal">
        <button className="auth-modal-close" onClick={onClose}><IconX /></button>

        <div className="auth-tabs">
          <button className={`auth-tab${screen === 'login' ? ' active' : ''}`} onClick={() => { setScreen('login'); setError(''); }}>Sign In</button>
          <button className={`auth-tab${screen === 'register' ? ' active' : ''}`} onClick={() => { setScreen('register'); setError(''); }}>Register</button>
        </div>

        {screen === 'login' && (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-field">
              <label>Username</label>
              <input type="text" placeholder="Your username" required value={loginForm.username} onChange={e => setLogin(p => ({ ...p, username: e.target.value }))} />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <input type="password" placeholder="Your password" required value={loginForm.password} onChange={e => setLogin(p => ({ ...p, password: e.target.value }))} />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="auth-submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</button>
            <p className="auth-switch">New business? <button type="button" onClick={() => { setScreen('register'); setError(''); }}>Register here</button></p>
          </form>
        )}

        {screen === 'register' && (
          <form className="auth-form" onSubmit={handleRegister}>
            <p className="auth-section-label">Account</p>
            <div className="auth-grid">
              <div className="auth-field">
                <label>Username *</label>
                <input type="text" placeholder="Choose a username" required value={regForm.username} onChange={updateReg('username')} />
              </div>
              <div className="auth-field">
                <label>Password *</label>
                <input type="password" placeholder="Min. 8 characters" required minLength={8} value={regForm.password} onChange={updateReg('password')} />
              </div>
            </div>
            <p className="auth-section-label">Business Details</p>
            <div className="auth-field">
              <label>Business Name *</label>
              <input type="text" placeholder="Your business name" required value={regForm.business_name} onChange={updateReg('business_name')} />
            </div>
            <div className="auth-grid">
              <div className="auth-field">
                <label>Contact Person</label>
                <input type="text" placeholder="Your full name" value={regForm.contact_person} onChange={updateReg('contact_person')} />
              </div>
              <div className="auth-field">
                <label>Phone</label>
                <input type="tel" placeholder="98XXXXXXXX" value={regForm.phone} onChange={updateReg('phone')} />
              </div>
              <div className="auth-field">
                <label>Email</label>
                <input type="email" placeholder="business@email.com" value={regForm.email} onChange={updateReg('email')} />
              </div>
              <div className="auth-field">
                <label>Address</label>
                <input type="text" placeholder="Street, Ward, City" value={regForm.address} onChange={updateReg('address')} />
              </div>
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="auth-submit" disabled={loading}>{loading ? 'Creating account…' : 'Create Account'}</button>
            <p className="auth-switch">Already registered? <button type="button" onClick={() => { setScreen('login'); setError(''); }}>Sign in here</button></p>
          </form>
        )}
      </div>
    </div>
  );
};

const EditProfileModal = ({ currentUser, onClose, onSave }) => {
  const biz = currentUser?.business_details;
  const [form,    setForm]    = useState({ name: biz?.name || '', contact_person: biz?.contact_person || '', phone: biz?.phone || '', email: biz?.email || '', address: biz?.address || '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const overlayRef = useRef(null);

  const update = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const updatedUser = await api.patch('/auth/me/update', form);
      onSave(updatedUser);
      onClose();
    } catch { setError('Cannot reach server.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-overlay" ref={overlayRef} onClick={(e) => e.target === overlayRef.current && onClose()}>
      <div className="auth-modal">
        <button className="auth-modal-close" onClick={onClose}><IconX /></button>
        <h2 className="edit-profile-title">Edit Business Profile</h2>
        <form className="auth-form" onSubmit={handleSave}>
          <div className="auth-field">
            <label>Business Name *</label>
            <input type="text" required value={form.name} onChange={update('name')} placeholder="Your business name" />
          </div>
          <div className="auth-grid">
            <div className="auth-field">
              <label>Contact Person</label>
              <input type="text" value={form.contact_person} onChange={update('contact_person')} placeholder="Your full name" />
            </div>
            <div className="auth-field">
              <label>Phone</label>
              <input type="tel" value={form.phone} onChange={update('phone')} placeholder="98XXXXXXXX" />
            </div>
            <div className="auth-field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={update('email')} placeholder="business@email.com" />
            </div>
            <div className="auth-field">
              <label>Address</label>
              <input type="text" value={form.address} onChange={update('address')} placeholder="Street, Ward, City" />
            </div>
          </div>
          {error && <p className="auth-error">{error}</p>}
          <div className="edit-profile-actions">
            <button type="button" className="edit-profile-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="auth-submit edit-profile-submit" disabled={loading}>{loading ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserDropdown = ({ currentUser, onNavigate, onLogout, onEditProfile }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

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
        <span className="user-avatar-icon"><IconUser /></span>
        <span className="user-label">{label}</span>
        <IconChevron open={open} />
      </button>

      {open && (
        <div className="user-dropdown-menu">
          {currentUser.business_details?.name && (
            <div className="dropdown-context">
              <IconBuilding />
              <span className="dropdown-context-label">{currentUser.business_details.name}</span>
            </div>
          )}

          {currentUser.role === 'ADMIN' ? (
            <button className="desktop-hide" onClick={go(() => onNavigate('admin'))}>
              <IconShield /> Admin Panel
            </button>
          ) : (
            <button className="desktop-hide" onClick={go(() => onNavigate('dashboard'))}>
              <IconGrid /> Dashboard
            </button>
          )}

          <button onClick={go(() => onNavigate('order'))}>
            <IconCart /> Place Order
          </button>

          {currentUser.role !== 'ADMIN' && (
            <button onClick={go(onEditProfile)}>
              <IconEdit /> Edit Profile
            </button>
          )}

          <div className="dropdown-divider" />

          <button className="dropdown-logout" onClick={go(onLogout)}>
            <IconLogout /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

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
    { id: 'home',    icon: <IconHome />,  label: 'HOME'    },
    { id: 'order',   icon: <IconCart />,  label: 'ORDER'   },
    { id: 'contact', icon: <IconPhone />, label: 'CONTACT' },
  ];

  return (
    <>
      <header className={`header${scrolled ? ' shrink' : ''}`}>
        <div className="header-left" onClick={() => navTo('home')} style={{ cursor: 'pointer' }}>
          <div className="logo-mark">
            <img className="logo-icon" src="/logo.png" alt="Logo" />
          </div>
          <div className="brand-name">
            <span className="brand-line1">Sheetal</span>
            <span className="brand-line2">Ice Cream</span>
          </div>
        </div>

        <nav className={`nav-center${menuOpen ? ' open' : ''}`}>
          {navPages.map(({ id, icon, label }) => (
            <button key={id} className={`nav-btn${activePage === id ? ' active' : ''}`} onClick={() => navTo(id)}>
              <span className="nav-icon">{icon}</span>
              {label}
            </button>
          ))}

          <div className="mobile-auth-section">
            {currentUser ? (
              <>
                {currentUser.role === 'ADMIN' ? (
                  <button className="nav-btn" onClick={() => navTo('admin')}>
                    <span className="nav-icon"><IconShield /></span> ADMIN PANEL
                  </button>
                ) : (
                  <button className="nav-btn" onClick={() => navTo('dashboard')}>
                    <span className="nav-icon"><IconGrid /></span> DASHBOARD
                  </button>
                )}
                {currentUser.role !== 'ADMIN' && (
                  <button className="nav-btn" onClick={() => { setShowEditProf(true); setMenuOpen(false); }}>
                    <span className="nav-icon"><IconEdit /></span> EDIT PROFILE
                  </button>
                )}
                <button className="nav-btn nav-logout" onClick={() => { onLogout(); setMenuOpen(false); }}>
                  <span className="nav-icon"><IconLogout /></span> SIGN OUT
                </button>
              </>
            ) : (
              <button className="nav-btn nav-login-mobile" onClick={() => { setShowAuth(true); setMenuOpen(false); }}>
                <span className="nav-icon"><IconUser /></span> LOGIN / REGISTER
              </button>
            )}
          </div>
        </nav>

        <div className="header-right-controls">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {isDark ? <IconSun /> : <IconMoon />}
          </button>

          {currentUser && currentUser.role !== 'ADMIN' && (
            <button className={`nav-btn desktop-dashboard-btn${activePage === 'dashboard' ? ' active' : ''}`} onClick={() => navTo('dashboard')}>
              <span className="nav-icon"><IconGrid /></span> DASHBOARD
            </button>
          )}
          {currentUser && currentUser.role === 'ADMIN' && (
            <button className={`nav-btn desktop-dashboard-btn admin-panel-btn${activePage === 'admin' ? ' active' : ''}`} onClick={() => navTo('admin')}>
              <span className="nav-icon"><IconShield /></span> ADMIN
            </button>
          )}

          <div className="desktop-auth">
            {currentUser ? (
              <UserDropdown currentUser={currentUser} onNavigate={navTo} onLogout={onLogout} onEditProfile={() => setShowEditProf(true)} />
            ) : (
              <button className="auth-btn" onClick={() => setShowAuth(true)}>
                <IconUser /> Login / Register
              </button>
            )}
          </div>

          <button className={`hamburger${menuOpen ? ' active' : ''}`} onClick={() => setMenuOpen(prev => !prev)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={onLogin} />}

      {showEditProf && currentUser && (
        <EditProfileModal
          currentUser={currentUser}
          onClose={() => setShowEditProf(false)}
          onSave={(updatedUser) => { onProfileUpdate?.(updatedUser); setShowEditProf(false); }}
        />
      )}
    </>
  );
};

export default Header;