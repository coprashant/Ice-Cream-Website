import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api';
import './Dashboard.css';

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────
const DashboardSkeleton = () => (
  <div className="dashboard-container">
    <div style={{ marginBottom: '32px' }}>
      <div className="skeleton" style={{ width: '120px', height: '14px', marginBottom: '8px' }} />
      <div className="skeleton" style={{ width: '260px', height: '36px', marginBottom: '6px' }} />
      <div className="skeleton" style={{ width: '160px', height: '18px' }} />
    </div>
    <div className="skeleton-stats">
      {[1,2,3,4].map(i => <div key={i} className="skeleton skeleton-card" />)}
    </div>
    <div className="skeleton" style={{ width: '300px', height: '44px', borderRadius: '14px', marginBottom: '24px' }} />
    <div className="skeleton-content-grid">
      <div className="skeleton skeleton-block" />
      <div className="skeleton skeleton-block" />
    </div>
  </div>
);

// ─────────────────────────────────────────────
// First-login welcome banner
// ─────────────────────────────────────────────
const WelcomeBanner = ({ name, onDismiss }) => (
  <div className="welcome-banner">
    <div className="welcome-banner-left">
      <span className="welcome-banner-icon">🎉</span>
      <div>
        <p className="welcome-banner-title">
          Welcome to your dashboard{name ? `, ${name}` : ''}!
        </p>
        <p className="welcome-banner-sub">
          Place orders, track their status, and manage your business profile — all from here.
        </p>
      </div>
    </div>
    <button className="welcome-banner-dismiss" onClick={onDismiss} aria-label="Dismiss">✕</button>
  </div>
);

// ─────────────────────────────────────────────
// Status stepper
// ─────────────────────────────────────────────
const STATUS_STEPS = ['Pending', 'Confirmed', 'Completed'];
const STEP_LABELS  = { Pending: 'Received', Confirmed: 'Confirmed', Completed: 'Delivered' };
const STEP_ICONS   = { Pending: '📥', Confirmed: '✅', Completed: '🎉' };

const StatusStepper = ({ status }) => {
  if (status === 'Cancelled') {
    return (
      <div className="status-cancelled-bar">
        <span>❌</span>
        <span className="cancelled-label">Order Cancelled</span>
      </div>
    );
  }
  const currentIndex = STATUS_STEPS.indexOf(status);
  return (
    <div className="status-stepper">
      {STATUS_STEPS.map((step, i) => {
        const isDone   = i < currentIndex;
        const isActive = i === currentIndex;
        return (
          <React.Fragment key={step}>
            <div className={`step ${isDone ? 'done' : isActive ? 'active' : 'pending'}`}>
              <div className="step-bubble">{isDone ? '✓' : STEP_ICONS[step]}</div>
              <span className="step-label">{STEP_LABELS[step]}</span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`step-connector${isDone ? ' done' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    Pending:   { cls: 'badge-pending',   icon: '⏳' },
    Confirmed: { cls: 'badge-confirmed', icon: '✅' },
    Completed: { cls: 'badge-completed', icon: '🎉' },
    Cancelled: { cls: 'badge-cancelled', icon: '❌' },
  };
  const { cls, icon } = map[status] || { cls: '', icon: '•' };
  return <span className={`status-badge ${cls}`}>{icon} {status}</span>;
};

// ─────────────────────────────────────────────
// Quick Reorder widget
// ─────────────────────────────────────────────
const QuickReorderWidget = ({ orders, onReorder }) => {
  const lastOrder = orders.find(o => o.status !== 'Cancelled');

  const topItems = useMemo(() => {
    const tally = {};
    orders.forEach(o =>
      o.items.forEach(item => {
        tally[item.item_name] = (tally[item.item_name] || 0) + item.quantity;
      })
    );
    return Object.entries(tally)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, qty]) => ({ name, qty }));
  }, [orders]);

  if (!lastOrder && topItems.length === 0) return null;

  return (
    <div className="quick-reorder-widget">
      <p className="quick-reorder-title">⚡ Quick Reorder</p>
      <div className="quick-reorder-body">
        {lastOrder && (
          <div className="quick-card">
            <p className="quick-card-label">Last Order</p>
            <p className="quick-card-id">#{lastOrder.id}</p>
            <div className="quick-card-chips">
              {lastOrder.items.slice(0, 2).map((item, i) => (
                <span key={i} className="quick-chip">{item.item_name}</span>
              ))}
              {lastOrder.items.length > 2 && (
                <span className="quick-chip muted">+{lastOrder.items.length - 2} more</span>
              )}
            </div>
            <p className="quick-card-total">रु{parseFloat(lastOrder.total_amount).toFixed(2)}</p>
            <button className="btn-quick-reorder" onClick={() => onReorder(lastOrder)}>
              🔄 Reorder
            </button>
          </div>
        )}
        {topItems.length > 0 && (
          <div className="quick-card">
            <p className="quick-card-label">Your Favourites</p>
            <div className="top-items-list">
              {topItems.map((item, i) => (
                <div key={i} className="top-item-row">
                  <span className="top-item-rank">#{i + 1}</span>
                  <span className="top-item-name">{item.name}</span>
                  <span className="top-item-count">{item.qty} ordered</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Order card (Orders tab)
// ─────────────────────────────────────────────
const OrderCard = ({ order, onReorder, onCancel }) => {
  const [expanded,    setExpanded]    = useState(false);
  const [cancelling,  setCancelling]  = useState(false);
  const [cancelError, setCancelError] = useState('');

  const handleCancel = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Cancel Order #${order.id}? This cannot be undone.`)) return;
    setCancelling(true);
    setCancelError('');
    try {
      const ok = await onCancel(order.id);
      if (!ok) setCancelError('Could not cancel. Please try again.');
    } catch {
      setCancelError('Network error.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="order-hist-card">
      <div className="order-hist-header" onClick={() => setExpanded(e => !e)}>
        <div className="order-hist-left">
          <span className="order-hist-id">Order #{order.id}</span>
          <span className="order-hist-date">
            {new Date(order.order_date).toLocaleDateString('en-NP', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </span>
        </div>
        <div className="order-hist-right">
          <StatusBadge status={order.status} />
          <span className="order-hist-total">
            रु{parseFloat(order.total_amount).toFixed(2)}
          </span>
          <span className={`expand-icon${expanded ? ' open' : ''}`}>▾</span>
        </div>
      </div>

      {expanded && (
        <div className="order-hist-body">
          <StatusStepper status={order.status} />
          <div className="order-items-list">
            {order.items.map((item, i) => (
              <div key={i} className="order-hist-item">
                <span className="hist-item-name">{item.item_name}</span>
                <span className="hist-item-qty">× {item.quantity}</span>
                <span className="hist-item-price">रु{parseFloat(item.price).toFixed(2)}</span>
                <span className="hist-item-sub">रु{parseFloat(item.subtotal).toFixed(2)}</span>
              </div>
            ))}
          </div>
          {cancelError && <p className="cancel-error">{cancelError}</p>}
          <div className="order-hist-footer">
            {order.status === 'Pending' && (
              <button
                className="btn-cancel-order"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? '⏳ Cancelling…' : '✕ Cancel Order'}
              </button>
            )}
            <button className="btn-reorder" onClick={() => onReorder(order)}>
              🔄 Quick Reorder
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Spending trend helper
// ─────────────────────────────────────────────
const getSpendingTrend = (orders) => {
  const now       = new Date();
  const thisMonth = now.getMonth(), thisYear = now.getFullYear();
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastYear  = thisMonth === 0 ? thisYear - 1 : thisYear;

  const sum = (m, y) => orders
    .filter(o => { const d = new Date(o.order_date); return d.getMonth() === m && d.getFullYear() === y; })
    .reduce((s, o) => s + parseFloat(o.total_amount), 0);

  const thisSpend = sum(thisMonth, thisYear);
  const lastSpend = sum(lastMonth, lastYear);
  if (!thisSpend && !lastSpend) return null;

  const diff = thisSpend - lastSpend;
  const pct  = lastSpend ? Math.abs(Math.round((diff / lastSpend) * 100)) : null;
  return { pct, up: diff >= 0 };
};

// ─────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────
const Dashboard = ({ currentUser, setActivePage, onLogout, onProfileUpdate }) => {
  const [profile,      setProfile]      = useState(null);
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [reorderMsg,   setReorderMsg]   = useState('');
  const [reorderError, setReorderError] = useState('');
  const [activeTab,    setActiveTab]    = useState('overview');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showWelcome,  setShowWelcome]  = useState(false);

  useEffect(() => {
    const key = `welcomed_${currentUser.id}`;
    if (!localStorage.getItem(key)) setShowWelcome(true);
  }, [currentUser.id]);

  const dismissWelcome = () => {
    localStorage.setItem(`welcomed_${currentUser.id}`, '1');
    setShowWelcome(false);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [me, ord] = await Promise.all([
          api.get('/auth/me'),
          api.get('/orders/my-orders'),
        ]);
        setProfile(me);
        setOrders(ord);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser.id]);

  const handleCancel = async (orderId) => {
    try {
      const updated = await api.patch(`/orders/${orderId}/cancel`, {});
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      return true;
    } catch {
      return false;
    }
  };

  const handleReorder = async (order) => {
    setReorderError('');
    try {
      const newOrder = await api.post('/orders/place', {
        business: currentUser.business,
        items: order.items.map(i => ({
          item_name: i.item_name,
          quantity:  i.quantity,
          price:     parseFloat(i.price),
        })),
      });
      setOrders(prev => [newOrder, ...prev]);
      setReorderMsg(`✅ Reorder placed! Order #${newOrder.id}`);
      setTimeout(() => setReorderMsg(''), 4000);
    } catch (err) {
      setReorderError(err.message || 'Reorder failed. Please try again.');
      setTimeout(() => setReorderError(''), 4000);
    }
  };

  const business       = profile?.business_details;
  const totalOrders    = orders.length;
  const totalSpent     = orders.reduce((s, o) => s + parseFloat(o.total_amount), 0);
  const pendingCount   = orders.filter(o => o.status === 'Pending').length;
  const completedCount = orders.filter(o => o.status === 'Completed').length;
  const trend          = useMemo(() => getSpendingTrend(orders), [orders]);

  const filterCounts = useMemo(() => ({
    All:       orders.length,
    Pending:   orders.filter(o => o.status === 'Pending').length,
    Confirmed: orders.filter(o => o.status === 'Confirmed').length,
    Completed: orders.filter(o => o.status === 'Completed').length,
    Cancelled: orders.filter(o => o.status === 'Cancelled').length,
  }), [orders]);

  const filteredOrders = filterStatus === 'All'
    ? orders
    : orders.filter(o => o.status === filterStatus);

  if (loading) return <div className="dashboard-page"><DashboardSkeleton /></div>;

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="dash-error">
            <span>⚠️</span>
            <p>{error}</p>
            <button className="btn-primary-dash" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {showWelcome && (
          <WelcomeBanner
            name={business?.contact_person || currentUser.username}
            onDismiss={dismissWelcome}
          />
        )}

        <div className="dash-header">
          <span className="section-eyebrow">My Dashboard</span>
          <h1 className="dash-title">
            {business?.contact_person || currentUser.username}
          </h1>
          <p className="dash-subtitle">{business?.name}</p>
        </div>

        {reorderMsg   && <div className="reorder-banner">{reorderMsg}</div>}
        {reorderError && <div className="reorder-banner reorder-banner-error">{reorderError}</div>}

        <div className="stats-grid">
          <div className="stat-card stat-card-accent">
            <span className="stat-icon">💰</span>
            <div>
              <span className="stat-value">रु{totalSpent.toFixed(0)}</span>
              <span className="stat-label">Total Spent</span>
              {trend && (
                <span className={`stat-trend ${trend.up ? 'trend-up' : 'trend-down'}`}>
                  {trend.up ? '▲' : '▼'}{' '}
                  {trend.pct !== null ? `${trend.pct}% vs last month` : 'this month'}
                </span>
              )}
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📦</span>
            <div>
              <span className="stat-value">{totalOrders}</span>
              <span className="stat-label">Total Orders</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⏳</span>
            <div>
              <span className="stat-value">{pendingCount}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🎉</span>
            <div>
              <span className="stat-value">{completedCount}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
        </div>

        <div className="dash-tabs">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'orders',   label: '📦 Orders' },
            { id: 'profile',  label: '🏢 Profile' },
          ].map(tab => (
            <button
              key={tab.id}
              className={`dash-tab${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="tab-content">
            {orders.length === 0 ? (
              <div className="dash-card overview-empty-card">
                <span className="overview-empty-icon">🍦</span>
                <h3>No orders yet</h3>
                <p>Head to the Order page to place your first order.</p>
                <button className="btn-primary-dash" onClick={() => setActivePage('order')}>
                  Place Your First Order →
                </button>
              </div>
            ) : (
              <div className="overview-feed">
                <QuickReorderWidget orders={orders} onReorder={handleReorder} />
                <div className="dash-card">
                  <div className="dash-card-header">
                    <h3>Recent Orders</h3>
                    <button className="link-btn" onClick={() => setActiveTab('orders')}>
                      View all →
                    </button>
                  </div>
                  <div className="recent-orders-list">
                    {orders.slice(0, 3).map(order => (
                      <div key={order.id} className="recent-order-row">
                        <div className="recent-order-info">
                          <span className="recent-order-id">#{order.id}</span>
                          <span className="recent-order-date">
                            {new Date(order.order_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="recent-order-right">
                          <StatusBadge status={order.status} />
                          <span className="recent-order-total">
                            रु{parseFloat(order.total_amount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="tab-content">
            <div className="filter-bar">
              {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => (
                <button
                  key={s}
                  className={`filter-btn filter-${s.toLowerCase()}${filterStatus === s ? ' active' : ''}`}
                  onClick={() => setFilterStatus(s)}
                >
                  {s}
                  <span className="filter-count">{filterCounts[s]}</span>
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="empty-state large">
                <span>📦</span>
                <p>
                  {filterStatus === 'All'
                    ? 'No orders yet.'
                    : `No ${filterStatus.toLowerCase()} orders.`}
                </p>
              </div>
            ) : (
              <div className="orders-list">
                {filteredOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onReorder={handleReorder}
                    onCancel={handleCancel}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="tab-content">
            <div className="dash-card profile-card">
              <div className="dash-card-header">
                <h3>🏢 Business Details</h3>
                <p className="profile-edit-hint">
                  Edit via <strong>👤 menu</strong> in the top bar
                </p>
              </div>
              <div className="profile-detail-grid">
                {[
                  { label: 'Business Name',  value: business?.name,           icon: '🏢' },
                  { label: 'Contact Person', value: business?.contact_person, icon: '👤' },
                  { label: 'Phone',          value: business?.phone,          icon: '📞' },
                  { label: 'Email',          value: business?.email,          icon: '✉️' },
                  { label: 'Address',        value: business?.address,        icon: '📍' },
                  { label: 'Member Since',   icon: '📅',
                    value: business?.created_at
                      ? new Date(business.created_at).toLocaleDateString() : '—' },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="profile-detail-item">
                    <span className="profile-detail-icon">{icon}</span>
                    <div>
                      <span className="profile-detail-label">{label}</span>
                      <span className="profile-detail-value">{value || '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;