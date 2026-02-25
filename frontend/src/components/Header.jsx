import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import './Header.css';

const Header = ({ activePage, setActivePage }) => {
  const { isDark, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
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

      <div className="header-right-controls">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        <button
          className={`hamburger${menuOpen ? ' active' : ''}`}
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </div>

      <nav className={`nav-right${menuOpen ? ' open' : ''}`}>
        {['home', 'order', 'contact'].map(page => (
          <button
            key={page}
            className={`nav-btn${activePage === page ? ' active' : ''}`}
            onClick={() => navTo(page)}
          >
            {page === 'home' && <span className="nav-icon">🏠</span>}
            {page === 'order' && <span className="nav-icon">🛒</span>}
            {page === 'contact' && <span className="nav-icon">📞</span>}
            {page.toUpperCase()}
          </button>
        ))}
      </nav>
    </header>
  );
};

export default Header;
