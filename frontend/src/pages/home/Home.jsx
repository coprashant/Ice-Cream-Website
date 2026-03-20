import React, { useState, useEffect, useRef, useMemo } from 'react';
import { flavourData } from '../../data/flavours';
import './Home.css';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const IconSearch  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconX       = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconCart    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
const IconChevron = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
const IconPin     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconPhone   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
const IconClock   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconStar    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconMtn     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 18 9 6 13 13 16 9 21 18"/></svg>;
const IconBox     = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;

const FlavourCard = ({ item, category, index }) => {
  const ref = useRef(null);

  useEffect(() => {
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

const FilterBar = ({ query, setQuery, activeCategory, setActiveCategory, priceRange, setPriceRange, categories }) => (
  <div className="filter-bar" role="search">
    <div className="filter-search">
      <span className="filter-search-icon"><IconSearch /></span>
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
          <IconX />
        </button>
      )}
    </div>

    <div className="filter-pills" role="group" aria-label="Filter by category">
      <button
        className={`filter-pill${activeCategory === 'All' ? ' active' : ''}`}
        onClick={() => setActiveCategory('All')}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          className={`filter-pill${activeCategory === cat ? ' active' : ''}`}
          onClick={() => setActiveCategory(cat)}
        >
          {cat}
        </button>
      ))}
    </div>

    <div className="filter-price">
      <label className="filter-price-label" htmlFor="price-range">
        Under रु{priceRange}
      </label>
      <input
        id="price-range"
        type="range"
        className="filter-range"
        min={50} max={500} step={50}
        value={priceRange}
        onChange={(e) => setPriceRange(Number(e.target.value))}
        aria-label={`Max price: रु${priceRange}`}
      />
    </div>
  </div>
);

const Home = ({ setActivePage }) => {
  const heroRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(500);

  const categories = Object.keys(flavourData);

  useEffect(() => {
    const timer = setTimeout(() => heroRef.current?.classList.add('hero-loaded'), 100);
    return () => clearTimeout(timer);
  }, []);

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

      <section ref={heroRef} className="hero">
        <div className="hero-bg">
          <div className="blob blob-1" style={{ transform: `translate(${offset.x * -0.5}px, ${offset.y * -0.5}px)` }} />
          <div className="blob blob-2" style={{ transform: `translate(${offset.x * 0.3}px, ${offset.y * 0.3}px)` }} />
          <div className="blob blob-3" style={{ transform: `translate(${offset.x * -0.2}px, ${offset.y * -0.2}px)` }} />
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <IconMtn /> Made in Nepal · Est. 2020
          </div>
          <h1 className="hero-title">
            The Sweetest<br />
            <span className="hero-accent">Moments</span><br />
            Start Here
          </h1>
          <p className="hero-subtitle">
            Handcrafted ice creams and kulfis made with love,<br />
            delivered fresh to your doorstep.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => setActivePage('order')}>
              <IconCart /> Order Now
            </button>
            <a className="btn-ghost" href="#flavours-section">
              View Flavours <IconChevron />
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
              <span className="meta-num meta-rating"><IconStar /> 4.9</span>
              <span className="meta-label">Rating</span>
            </div>
          </div>
        </div>

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

      <div className="info-strip">
        <div className="info-item">
          <IconPin />
          <span>Thapathali, Kathmandu</span>
        </div>
        <div className="info-divider" />
        <div className="info-item">
          <IconPhone />
          <a href="tel:+9779800000000">9800000000</a>
          <span>/</span>
          <a href="tel:+9779811111111">9811111111</a>
        </div>
        <div className="info-divider" />
        <div className="info-item">
          <IconClock />
          <span>Open Daily · 9AM – 9PM</span>
        </div>
      </div>

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

        {isFiltering && (
          <p className="filter-result-count" aria-live="polite">
            {totalResults === 0
              ? 'No flavours match your search.'
              : `Showing ${totalResults} flavour${totalResults !== 1 ? 's' : ''}`}
          </p>
        )}

        {categoriesWithIndex.length > 0 ? (
          categoriesWithIndex.map(({ category, items, startIndex }) => (
            <div key={category} className="category-group">
              <h3 className="category-title">{category}</h3>
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
            <div className="filter-empty-icon"><IconBox /></div>
            <p>No flavours found. Try adjusting your search or filters.</p>
            <button className="btn-ghost" onClick={clearFilters}>Clear Filters</button>
          </div>
        )}

        {!isFiltering && (
          <div className="order-cta">
            <p>Ready to indulge? Place your order now.</p>
            <button className="btn-primary" onClick={() => setActivePage('order')}>
              <IconCart /> Order Now
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;