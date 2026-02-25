import React from 'react';
import './Footer.css';

const Footer = ({ setActivePage }) => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <span>🍦</span>
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
        </div>

        <div className="footer-contact">
          <a href="tel:+9779841550000">📞 9841550000</a>
          <a href="mailto:sheetal.icecream@gmail.com">✉️ sheetal.icecream@gmail.com</a>
          <span>📍 Gokarneshwor-8, Kathmandu</span>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 Sheetal Ice-Cream Udhyog · All Rights Reserved</p>
      </div>
    </footer>
  );
};

export default Footer;
