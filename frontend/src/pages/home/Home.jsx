import React, { useEffect, useRef } from 'react';
import { flavourData } from '../../data/flavours';
import './Home.css';

const FlavourCard = ({ item, category, index }) => {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) ref.current?.classList.add('visible'); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="flavour-card" style={{ '--delay': `${index * 80}ms` }}>
      <span className="flavour-emoji">{item.emoji}</span>
      <div className="flavour-info">
        <span className="flavour-name">{item.name}</span>
        <span className="flavour-category">{category}</span>
      </div>
      <span className="flavour-price">रु{item.price}</span>
    </div>
  );
};

const Home = ({ setActivePage }) => {
  const heroRef = useRef(null);

  useEffect(() => {
    setTimeout(() => heroRef.current?.classList.add('hero-loaded'), 100);
  }, []);

  let cardIndex = 0;

  return (
    <div className="home-page">
      {/* Hero */}
      <section ref={heroRef} className="hero">
        <div className="hero-bg">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">🏔️ Made in Nepal · Est. 2020</div>
          <h1 className="hero-title">
            The Sweetest<br />
            <span className="hero-accent">Moments</span><br />
            Start Here
          </h1>
          <p className="hero-subtitle">
            Handcrafted ice creams & kulfis made with love,<br />
            delivered fresh to your doorstep.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => setActivePage('order')}>
              Order Now 🛒
            </button>
            <a className="btn-ghost" href="#flavours-section">
              View Flavours ↓
            </a>
          </div>
          <div className="hero-meta">
            <div className="meta-item">
              <span className="meta-num">11+</span>
              <span className="meta-label">Flavours</span>
            </div>
            <div className="meta-divider" />
            <div className="meta-item">
              <span className="meta-num">2</span>
              <span className="meta-label">Categories</span>
            </div>
            <div className="meta-divider" />
            <div className="meta-item">
              <span className="meta-num">⭐ 4.9</span>
              <span className="meta-label">Rating</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="ice-cream-showcase">
            <div className="scoop scoop-top">🍦</div>
            <div className="scoop scoop-mid">🍧</div>
            <div className="scoop scoop-bot">🧁</div>
          </div>
        </div>
      </section>

      {/* Info Strip */}
      <div className="info-strip">
        <div className="info-item">
          <span>📍</span>
          <span>Prakritinagar, Gokarneshwor-8, Kathmandu</span>
        </div>
        <div className="info-divider" />
        <div className="info-item">
          <span>📞</span>
          <a href="tel:+9779841550000">9841550000</a>
          <span>/</span>
          <a href="tel:+9779861187473">9861187473</a>
        </div>
        <div className="info-divider" />
        <div className="info-item">
          <span>🕐</span>
          <span>Open Daily · 9AM–9PM</span>
        </div>
      </div>

      {/* Flavours */}
      <section id="flavours-section" className="flavours-section">
        <div className="section-header">
          <span className="section-eyebrow">Our Menu</span>
          <h2 className="section-title">Fresh Flavours</h2>
          <p className="section-sub">From creamy classics to exotic kulfis — something for everyone</p>
        </div>

        {Object.entries(flavourData).map(([category, items]) => (
          <div key={category} className="category-group">
            <h3 className="category-title">
              <span>{category === 'Ice-Cream' ? '🍦' : '🧊'}</span>
              {category}
            </h3>
            <div className="flavours-grid">
              {items.map((item) => (
                <FlavourCard key={item.name} item={item} category={category} index={cardIndex++} />
              ))}
            </div>
          </div>
        ))}

        <div className="order-cta">
          <p>Ready to indulge? Place your order now!</p>
          <button className="btn-primary" onClick={() => setActivePage('order')}>
            Order Now 🛒
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
