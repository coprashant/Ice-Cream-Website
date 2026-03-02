import React, { useState } from 'react';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/home/Home';
import Order from './pages/order/Order';
import Contact from './pages/contact/Contact';
import Dashboard from './pages/dashboard/Dashboard';
import Admin from './pages/admin/Admin';

function AppContent() {
  const [activePage, setActivePage] = useState('home');
  const [pageKey,    setPageKey]    = useState(0);

  const [currentUser, setCurrentUser] = useState(() => {
    const userId     = localStorage.getItem('userId');
    const businessId = localStorage.getItem('businessId');
    const role       = localStorage.getItem('userRole');
    return userId ? { id: userId, business: businessId, role } : null;
  });

  const navigate = (page) => {
    setActivePage(page);
    setPageKey(k => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (user) => {
    localStorage.setItem('userId',     user.id);
    localStorage.setItem('businessId', user.business ?? '');
    localStorage.setItem('userRole',   user.role);
    setCurrentUser(user);
    navigate(user.role === 'ADMIN' ? 'admin' : 'dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('businessId');
    localStorage.removeItem('userRole');
    setCurrentUser(null);
    navigate('home');
  };

  const handleProfileUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'home':    return <Home setActivePage={navigate} />;
      case 'order':   return <Order currentUser={currentUser} setActivePage={navigate} />;
      case 'contact': return <Contact />;
      case 'dashboard':
        return currentUser && currentUser.role !== 'ADMIN'
          ? <Dashboard currentUser={currentUser} setActivePage={navigate} onLogout={handleLogout} onProfileUpdate={handleProfileUpdate} />
          : <Home setActivePage={navigate} />;
      case 'admin':
        return currentUser && currentUser.role === 'ADMIN'
          ? <Admin currentUser={currentUser} setActivePage={navigate} />
          : <Home setActivePage={navigate} />;
      default: return <Home setActivePage={navigate} />;
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