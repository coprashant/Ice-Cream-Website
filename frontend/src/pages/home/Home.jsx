import React, { useState, useEffect, useRef, useMemo } from 'react';
import { flavourData } from '../../data/flavours';
import './Home.css';

// Detect reduced motion preference once at module level
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const FlavourCard = ({ item, category, index }) => {
  const ref = useRef(null);

  useEffect(() => {
    // If reduced motion, skip the intersection observer and just show the card
    if (prefersReducedMotion) {
      ref.current?.classList.add('visible');
      return;
    }

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
    <div className="flavour-card-wrapper">
      <div
        ref={ref}
        className="flavour-card slide-reveal"
        style={{
          '--delay': prefersReducedMotion ? '0ms' : `${index * 100}ms`,
          '--slide-dist': prefersReducedMotion ? '0px' : `${(index % 4) * 25}px`,
        }}
      >
        <span className="flavour-emoji" role="img" aria-hidden="true">{item.emoji}</span>
        <div className="flavour-info">
          <span className="flavour-name">{item.name}</span>
          <span className="flavour-category">{category}</span>
        </div>
        <span className="flavour-price">रु{item.price}</span>
      </div>
    </div>
  );
};

// ── Filter Bar ──
const FilterBar = ({ query, setQuery, activeCategory, setActiveCategory, priceRange, setPriceRange, categories }) => (
  <div className="filter-bar" role="search">
    {/* Search input */}
    <div className="filter-search">
      <span className="filter-search-icon" aria-hidden="true">🔍</span>
      <input
        type="text"
        className="filter-input"
        placeholder="Search flavours…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search flavours"
      />
      {query && (
        <button className="filter-clear-btn" onClick={() => setQuery('')} aria-label="Clear search">
          ✕
        </button>
      )}
    </div>

    {/* Category pills */}
    <div className="filter-pills" role="group" aria-label="Filter by category">
      <button
        className={`filter-pill ${activeCategory === 'All' ? 'active' : ''}`}
        onClick={() => setActiveCategory('All')}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          className={`filter-pill ${activeCategory === cat ? 'active' : ''}`}
          onClick={() => setActiveCategory(cat)}
        >
          {cat === 'Ice-Cream' ? '🍦' : '🧊'} {cat}
        </button>
      ))}
    </div>

    {/* Price range */}
    <div className="filter-price">
      <label className="filter-price-label" htmlFor="price-range">
        Under रु{priceRange}
      </label>
      <input
        id="price-range"
        type="range"
        className="filter-range"
        min={50}
        max={500}
        step={50}
        value={priceRange}
        onChange={(e) => setPriceRange(Number(e.target.value))}
        aria-label={`Max price: रु${priceRange}`}
      />
    </div>
  </div>
);

// ── Home ──
const Home = ({ setActivePage }) => {
  const heroRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Filter state
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(500);

  const categories = Object.keys(flavourData);

  // Hero entrance
  useEffect(() => {
    const timer = setTimeout(() => heroRef.current?.classList.add('hero-loaded'), 100);
    return () => clearTimeout(timer);
  }, []);

  // Mouse parallax — skip on reduced motion or touch devices
  useEffect(() => {
    if (prefersReducedMotion) return;
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

  // Filtered data derived from filter state
  const filteredCategories = useMemo(() => {
    return Object.entries(flavourData)
      .filter(([category]) => activeCategory === 'All' || category === activeCategory)
      .map(([category, items]) => ({
        category,
        items: items.filter(
          (item) =>
            item.name.toLowerCase().includes(query.toLowerCase()) &&
            item.price <= priceRange
        ),
      }))
      .filter(({ items }) => items.length > 0);
  }, [query, activeCategory, priceRange]);

  // Stable card indices across filtered results
  const categoriesWithIndex = useMemo(() => {
    let idx = 0;
    return filteredCategories.map(({ category, items }) => {
      const startIndex = idx;
      idx += items.length;
      return { category, items, startIndex };
    });
  }, [filteredCategories]);

  const totalResults = categoriesWithIndex.reduce((sum, { items }) => sum + items.length, 0);
  const isFiltering = query !== '' || activeCategory !== 'All' || priceRange < 500;

  const clearFilters = () => {
    setQuery('');
    setActiveCategory('All');
    setPriceRange(500);
  };

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
            <button
              className="btn-primary"
              onClick={() => setActivePage('order')}
              aria-label="Go to order page"
            >
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
        <div className="hero-visual" aria-hidden="true">
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
          <span aria-hidden="true">📍</span>
          <span>Prakritinagar, Gokarneshwor-8, Kathmandu</span>
        </div>
        <div className="info-divider" />
        <div className="info-item">
          <span aria-hidden="true">📞</span>
          <a href="tel:+9779841550000">9841550000</a>
          <span>/</span>
          <a href="tel:+9779861187473">9861187473</a>
        </div>
        <div className="info-divider" />
        <div className="info-item">
          <span aria-hidden="true">🕐</span>
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

        <FilterBar
          query={query}
          setQuery={setQuery}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          categories={categories}
        />

        {/* Live result count when filtering */}
        {isFiltering && (
          <p className="filter-result-count" aria-live="polite">
            {totalResults === 0
              ? 'No flavours match your search.'
              : `Showing ${totalResults} flavour${totalResults !== 1 ? 's' : ''}`}
          </p>
        )}

        {/* Grid or empty state */}
        {categoriesWithIndex.length > 0 ? (
          categoriesWithIndex.map(({ category, items, startIndex }) => (
            <div key={category} className="category-group">
              <h3 className="category-title">
                <span aria-hidden="true">{category === 'Ice-Cream' ? '🍦' : '🧊'}</span>
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
          ))
        ) : (
          <div className="filter-empty">
            <span className="filter-empty-icon" aria-hidden="true">🍦</span>
            <p>No flavours found. Try adjusting your search or filters.</p>
            <button className="btn-ghost" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        )}

        {/* CTA only shown when not filtering */}
        {!isFiltering && (
          <div className="order-cta">
            <p>Ready to indulge? Place your order now!</p>
            <button
              className="btn-primary"
              onClick={() => setActivePage('order')}
              aria-label="Go to order page"
            >
              Order Now 🛒
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;