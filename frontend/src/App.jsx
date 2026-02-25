import React, { useState, useEffect } from 'react';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/home/Home';
import Order from './pages/order/Order';
import Contact from './pages/contact/Contact';

function AppContent() {
  const [activePage, setActivePage] = useState('home');
  const [pageKey, setPageKey] = useState(0);

  const navigate = (page) => {
    setActivePage(page);
    setPageKey(k => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (activePage) {
      case 'home': return <Home setActivePage={navigate} />;
      case 'order': return <Order />;
      case 'contact': return <Contact />;
      default: return <Home setActivePage={navigate} />;
    }
  };

  return (
    <div className="app">
      <Header activePage={activePage} setActivePage={navigate} />
      <main key={pageKey} className="page-enter page-enter-active">
        {renderPage()}
      </main>
      <Footer setActivePage={navigate} />
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
