import React, { useState, useEffect } from 'react';
import './index.css';
import { ThemeProvider }          from './context/ThemeContext';
import Header                     from './components/Header';
import Footer                     from './components/Footer';
import Home                       from './pages/home/Home';
import Order                      from './pages/order/Order';
import Contact                    from './pages/contact/Contact';
import Dashboard                  from './pages/dashboard/Dashboard';
import Admin                      from './pages/admin/Admin';
import { tokenStorage, decodeToken, setAuthFailureHandler } from './api';

// ── Read the stored user safely on startup ──
// Role is re-derived from the JWT payload, not from a plain stored string.
// This means even if someone edits localStorage manually, the server will
// reject their requests because the token signature won't match.
const getInitialUser = () => {
  const stored      = tokenStorage.getUser();
  const accessToken = tokenStorage.getAccess();
  if (!stored || !accessToken) return null;

  // Check the token hasn't expired client-side (server checks too, but
  // this avoids showing a logged-in UI to someone with a dead token)
  const payload = decodeToken(accessToken);
  if (!payload || payload.exp * 1000 < Date.now()) {
    tokenStorage.clearTokens();
    return null;
  }

  // Re-derive role from the token payload — not from localStorage directly
  return { ...stored, role: payload.role };
};

function AppContent() {
  const [activePage,   setActivePage]   = useState('home');
  const [pageKey,      setPageKey]      = useState(0);
  const [currentUser,  setCurrentUser]  = useState(getInitialUser);

  // Register the logout-on-auth-failure handler so api.js can call it
  // when a token refresh fails (session truly expired)
  useEffect(() => {
    setAuthFailureHandler(() => {
      setCurrentUser(null);
      setActivePage('home');
      setPageKey(k => k + 1);
    });
  }, []);

  const navigate = (page) => {
    setActivePage(page);
    setPageKey(k => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (responseData) => {
    // responseData = { access, refresh, user } from the backend
    tokenStorage.setTokens(responseData.access, responseData.refresh);
    tokenStorage.setUser(responseData.user);

    // Derive role from token payload — authoritative source
    const payload  = decodeToken(responseData.access);
    const user     = { ...responseData.user, role: payload?.role ?? responseData.user.role };
    setCurrentUser(user);

    navigate(user.role === 'ADMIN' ? 'admin' : 'dashboard');
  };

  const handleLogout = async () => {
    // Fire-and-forget — backend just acknowledges, main action is clearing tokens
    try {
      await import('./api').then(m => m.default.post('/auth/logout', {}));
    } catch { /* ignore — we clear locally regardless */ }

    tokenStorage.clearTokens();
    setCurrentUser(null);
    navigate('home');
  };

  const handleProfileUpdate = (updatedUser) => {
    tokenStorage.setUser(updatedUser);
    setCurrentUser(prev => ({ ...prev, ...updatedUser }));
  };

  // ── Route guards ──
  // These are redundant with server-side enforcement but prevent
  // accidental rendering of protected pages in the UI.
  const isAdmin    = currentUser?.role === 'ADMIN';
  const isLoggedIn = !!currentUser;

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <Home setActivePage={navigate} />;

      case 'order':
        return <Order currentUser={currentUser} setActivePage={navigate} />;

      case 'contact':
        return <Contact />;

      case 'dashboard':
        return isLoggedIn && !isAdmin
          ? <Dashboard
              currentUser={currentUser}
              setActivePage={navigate}
              onLogout={handleLogout}
              onProfileUpdate={handleProfileUpdate}
            />
          : <Home setActivePage={navigate} />;

      case 'admin':
        return isLoggedIn && isAdmin
          ? <Admin currentUser={currentUser} setActivePage={navigate} />
          : <Home setActivePage={navigate} />;

      default:
        return <Home setActivePage={navigate} />;
    }
  };

  return (
    <div className="app">
      <Header
        activePage={activePage}
        setActivePage={navigate}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onProfileUpdate={handleProfileUpdate}
      />
      <main key={pageKey} className="page-enter page-enter-active">
        {renderPage()}
      </main>
      <Footer setActivePage={navigate} currentUser={currentUser} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}