import React, { useState, useEffect, useRef } from 'react';
import { flavourData } from '../../data/flavours';
import './Home.css';

const FlavourCard = ({ item, category, index }) => {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          ref.current?.classList.add('visible');
          observer.unobserve(ref.current);
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="flavour-card slide-reveal"
      style={{
        '--delay': `${index * 100}ms`,
        '--slide-dist': `${(index % 4) * 25}px`,
      }}
    >
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
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Hero entrance animation
  useEffect(() => {
    const timer = setTimeout(() => heroRef.current?.classList.add('hero-loaded'), 100);
    return () => clearTimeout(timer);
  }, []);

  // Mouse parallax — only on non-touch devices
  useEffect(() => {
    const isTouchDevice = window.matchMedia('(hover: none)').matches;
    if (isTouchDevice) return;

    const handleMove = (e) => {
      const x = (window.innerWidth / 2 - e.pageX) / 30;
      const y = (window.innerHeight / 2 - e.pageY) / 30;
      setOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // Derive card indices cleanly outside JSX
  const categoriesWithIndex = Object.entries(flavourData).reduce((acc, [category, items]) => {
    const startIndex = acc.nextIndex;
    acc.categories.push({ category, items, startIndex });
    acc.nextIndex += items.length;
    return acc;
  }, { categories: [], nextIndex: 0 }).categories;

  return (
    <div className="home-page">

      {/* ── Hero ── */}
      <section ref={heroRef} className="hero">
        <div className="hero-bg">
          <div className="blob blob-1" style={{ transform: `translate(${offset.x * -0.5}px, ${offset.y * -0.5}px)` }} />
          <div className="blob blob-2" style={{ transform: `translate(${offset.x * 0.3}px, ${offset.y * 0.3}px)` }} />
          <div className="blob blob-3" style={{ transform: `translate(${offset.x * -0.2}px, ${offset.y * -0.2}px)` }} />
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

        {/* 3D Interactive Visual */}
        <div className="hero-visual">
          <div
            className="ice-cream-display"
            style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
          >
            <div className="scoop-wrapper s-1" style={{ transform: `translate(${offset.x * 0.4}px, ${offset.y * 0.4}px)` }}>
              <span className="scoop-icon">🍦</span>
              <div className="scoop-shadow" />
            </div>
            <div className="scoop-wrapper s-2" style={{ transform: `translate(${offset.x * -0.6}px, ${offset.y * -0.6}px)` }}>
              <span className="scoop-icon">🍧</span>
              <div className="scoop-shadow" />
            </div>
            <div className="scoop-wrapper s-3" style={{ transform: `translate(${offset.x * 0.8}px, ${offset.y * 0.8}px)` }}>
              <span className="scoop-icon">🧁</span>
              <div className="scoop-shadow" />
            </div>

            <div className="ingredient nut" style={{ transform: `translate(${offset.x * 1.5}px, ${offset.y * 1.5}px)` }}>🥜</div>
            <div className="ingredient leaf" style={{ transform: `translate(${offset.x * -1.2}px, ${offset.y * 1.2}px)` }}>🍃</div>
            <div className="ingredient berry" style={{ transform: `translate(${offset.x * 2}px, ${offset.y * -1}px)` }}>🍓</div>
          </div>
        </div>
      </section>

      {/* ── Info Strip ── */}
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

      {/* ── Flavours Section ── */}
      <section id="flavours-section" className="flavours-section">
        <div className="section-header">
          <span className="section-eyebrow">Our Menu</span>
          <h2 className="section-title">Fresh Flavours</h2>
          <p className="section-sub">From creamy classics to exotic kulfis — something for everyone</p>
        </div>

        {categoriesWithIndex.map(({ category, items, startIndex }) => (
          <div key={category} className="category-group">
            <h3 className="category-title">
              <span>{category === 'Ice-Cream' ? '🍦' : '🧊'}</span>
              {category}
            </h3>
            <div className="flavours-grid">
              {items.map((item, i) => (
                <FlavourCard
                  key={item.name}
                  item={item}
                  category={category}
                  index={startIndex + i}
                />
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