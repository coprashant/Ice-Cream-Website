import React from 'react';
import './Footer.css';

const IconPhone = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);

const IconMail = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const IconPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const Footer = ({ setActivePage, currentUser }) => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <img src="/logo.png" alt="Sheetal Ice Cream" />
          </div>
          <div>
            <div className="footer-brand-name">Sheetal Ice Cream</div>
            <div className="footer-tagline">Made with love in Kathmandu</div>
          </div>
        </div>

        <div className="footer-links">
          <button onClick={() => setActivePage('home')}>Home</button>
          <button onClick={() => setActivePage('order')}>Order</button>
          <button onClick={() => setActivePage('contact')}>Contact</button>
          {currentUser && (
            <button onClick={() => setActivePage('dashboard')}>Dashboard</button>
          )}
        </div>

        <div className="footer-contact">
          <a href="tel:+9779841550000">
            <IconPhone /> 98xxxxxxxx
          </a>
          <a href="mailto:sheetal.icecream@gmail.com">
            <IconMail /> sheetal.icecream@gmail.com
          </a>
          <span>
            <IconPin /> Gokarneshwor-8, Kathmandu
          </span>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Sheetal Ice-Cream Udhyog · All Rights Reserved</p>
      </div>
    </footer>
  );
};

export default Footer;