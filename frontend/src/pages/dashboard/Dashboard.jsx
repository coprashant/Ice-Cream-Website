import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../../api';
import './Dashboard.css';


// SVG Icons
const IconMoney   = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const IconBox     = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>;
const IconClock   = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconCheck   = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconUser    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconX       = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconRefresh = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>;
const IconChevron = ({ open }) => <svg className={`expand-chevron-svg${open ? ' open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>;
const IconBusiness= () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconPhone   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
const IconMail    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IconPin     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconCal     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;

// Skeleton
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

// Welcome Banner
const WelcomeBanner = ({ name, onDismiss }) => (
  <div className="welcome-banner">
    <div className="welcome-banner-left">
      <div className="welcome-banner-icon-wrap"><IconUser /></div>
      <div>
        <p className="welcome-banner-title">Welcome back{name ? `, ${name}` : ''}!</p>
        <p className="welcome-banner-sub">Place orders, track their status, and manage your business profile — all from here.</p>
      </div>
    </div>
    <button className="welcome-banner-dismiss" onClick={onDismiss} aria-label="Dismiss"><IconX /></button>
  </div>
);

// Status Stepper
const STATUS_STEPS = ['Pending', 'Confirmed', 'Completed'];
const STEP_LABELS  = { Pending: 'Received', Confirmed: 'Confirmed', Completed: 'Delivered' };

const StatusStepper = ({ status }) => {
  if (status === 'Cancelled') {
    return (
      <div className="status-cancelled-bar">
        <IconX />
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
              <div className="step-bubble">
                {isDone
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : <span className="step-num">{i + 1}</span>
                }
              </div>
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


// Status Badge
const StatusBadge = ({ status }) => {
  const map = { Pending: 'badge-pending', Confirmed: 'badge-confirmed', Completed: 'badge-completed', Cancelled: 'badge-cancelled' };
  return <span className={`status-badge ${map[status] || ''}`}>{status}</span>;
};

// Monthly Spending Bar Chart
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const buildMonthlyData = (orders) => {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const m = d.getMonth(), y = d.getFullYear();
    const total = orders
      .filter(o => { const od = new Date(o.order_date); return od.getMonth() === m && od.getFullYear() === y && o.status !== 'Cancelled'; })
      .reduce((s, o) => s + parseFloat(o.total_amount), 0);
    return { month: MONTHS[m], total: Math.round(total) };
  });
};

const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      <p className="chart-tooltip-value">रु{payload[0].value.toLocaleString()}</p>
    </div>
  );
};

const SpendingChart = ({ orders }) => {
  const data = useMemo(() => buildMonthlyData(orders), [orders]);
  if (!data.some(d => d.total > 0)) return <div className="chart-empty">No spending data yet</div>;
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barSize={26} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontFamily: 'DM Sans', fontSize: 11, fill: 'var(--text-muted)' }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontFamily: 'DM Sans', fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
        <Tooltip content={<BarTooltip />} cursor={{ fill: 'var(--accent-soft)' }} />
        <Bar dataKey="total" fill="var(--accent-primary)" radius={[5, 5, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Flavour Donut
const DONUT_COLORS = ['var(--accent-primary)', '#f97316', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

const buildFlavourData = (orders) => {
  const tally = {};
  orders.forEach(o => o.items.forEach(item => { tally[item.item_name] = (tally[item.item_name] || 0) + item.quantity; }));
  return Object.entries(tally).sort(([, a], [, b]) => b - a).slice(0, 6).map(([name, value]) => ({ name, value }));
};

const DonutTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{payload[0].name}</p>
      <p className="chart-tooltip-value">{payload[0].value} ordered</p>
    </div>
  );
};

const FlavourDonut = ({ orders }) => {
  const data = useMemo(() => buildFlavourData(orders), [orders]);
  if (!data.length) return <div className="chart-empty">No order data yet</div>;
  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie data={data} cx="50%" cy="48%" innerRadius={44} outerRadius={65} paddingAngle={3} dataKey="value" strokeWidth={0}>
          {data.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
        </Pie>
        <Tooltip content={<DonutTooltip />} />
        <Legend iconType="circle" iconSize={7} formatter={value => <span style={{ fontFamily: 'DM Sans', fontSize: '11px', color: 'var(--text-secondary)' }}>{value}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Quick Reorder Widget
const QuickReorderWidget = ({ orders, onReorder }) => {
  const lastOrder = orders.find(o => o.status !== 'Cancelled');
  const topItems  = useMemo(() => {
    const tally = {};
    orders.forEach(o => o.items.forEach(item => { tally[item.item_name] = (tally[item.item_name] || 0) + item.quantity; }));
    return Object.entries(tally).sort(([, a], [, b]) => b - a).slice(0, 3).map(([name, qty]) => ({ name, qty }));
  }, [orders]);

  if (!lastOrder && topItems.length === 0) return null;

  return (
    <div className="quick-reorder-widget">
      <p className="quick-reorder-title">Quick Reorder</p>
      <div className="quick-reorder-body">
        {lastOrder && (
          <div className="quick-card">
            <p className="quick-card-label">Last Order</p>
            <p className="quick-card-id">#{lastOrder.id}</p>
            <div className="quick-card-chips">
              {lastOrder.items.slice(0, 2).map((item, i) => <span key={i} className="quick-chip">{item.item_name}</span>)}
              {lastOrder.items.length > 2 && <span className="quick-chip muted">+{lastOrder.items.length - 2} more</span>}
            </div>
            <p className="quick-card-total">रु{parseFloat(lastOrder.total_amount).toFixed(2)}</p>
            <button className="btn-quick-reorder" onClick={() => onReorder(lastOrder)}>
              <IconRefresh /> Reorder
            </button>
          </div>
        )}
        {topItems.length > 0 && (
          <div className="quick-card">
            <p className="quick-card-label">Your Favourites</p>
            <div className="top-items-list">
              {topItems.map((item, i) => (
                <div key={i} className="top-item-row">
                  <span className="top-item-rank">{i + 1}</span>
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

// Order Card
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
    } catch { setCancelError('Network error.'); }
    finally { setCancelling(false); }
  };

  return (
    <div className="order-hist-card">
      <div className="order-hist-header" onClick={() => setExpanded(e => !e)}>
        <div className="order-hist-left">
          <span className="order-hist-id">Order #{order.id}</span>
          <span className="order-hist-date">{new Date(order.order_date).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
        <div className="order-hist-right">
          <StatusBadge status={order.status} />
          <span className="order-hist-total">रु{parseFloat(order.total_amount).toFixed(2)}</span>
          <IconChevron open={expanded} />
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
              <button className="btn-cancel-order" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? 'Cancelling…' : 'Cancel Order'}
              </button>
            )}
            <button className="btn-reorder" onClick={() => onReorder(order)}>
              <IconRefresh /> Reorder
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


// Spending Trend Helper

const getSpendingTrend = (orders) => {
  const now       = new Date();
  const thisMonth = now.getMonth(), thisYear = now.getFullYear();
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastYear  = thisMonth === 0 ? thisYear - 1 : thisYear;
  const sum = (m, y) => orders.filter(o => { const d = new Date(o.order_date); return d.getMonth() === m && d.getFullYear() === y; }).reduce((s, o) => s + parseFloat(o.total_amount), 0);
  const thisSpend = sum(thisMonth, thisYear), lastSpend = sum(lastMonth, lastYear);
  if (!thisSpend && !lastSpend) return null;
  const diff = thisSpend - lastSpend;
  const pct  = lastSpend ? Math.abs(Math.round((diff / lastSpend) * 100)) : null;
  return { pct, up: diff >= 0 };
};

// Dashboard
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
      setLoading(true); setError('');
      try {
        const [me, ord] = await Promise.all([api.get('/auth/me'), api.get('/orders/my-orders')]);
        setProfile(me); setOrders(ord);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard. Please refresh.');
      } finally { setLoading(false); }
    };
    load();
  }, [currentUser.id]);

  const handleCancel = async (orderId) => {
    try {
      const updated = await api.patch(`/orders/${orderId}/cancel`, {});
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      return true;
    } catch { return false; }
  };

  const handleReorder = async (order) => {
    setReorderError('');
    try {
      const newOrder = await api.post('/orders/place', {
        business: currentUser.business,
        items: order.items.map(i => ({ item_name: i.item_name, quantity: i.quantity, price: parseFloat(i.price) })),
      });
      setOrders(prev => [newOrder, ...prev]);
      setReorderMsg(`Reorder placed — Order #${newOrder.id}`);
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

  const filteredOrders = filterStatus === 'All' ? orders : orders.filter(o => o.status === filterStatus);

  if (loading) return <div className="dashboard-page"><DashboardSkeleton /></div>;

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="dash-error">
            <p>{error}</p>
            <button className="btn-primary-dash" onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  const profileFields = [
    { label: 'Business Name',  value: business?.name,           icon: <IconBusiness /> },
    { label: 'Contact Person', value: business?.contact_person, icon: <IconUser /> },
    { label: 'Phone',          value: business?.phone,          icon: <IconPhone /> },
    { label: 'Email',          value: business?.email,          icon: <IconMail /> },
    { label: 'Address',        value: business?.address,        icon: <IconPin /> },
    { label: 'Member Since',   value: business?.created_at ? new Date(business.created_at).toLocaleDateString() : '—', icon: <IconCal /> },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {showWelcome && <WelcomeBanner name={business?.contact_person || currentUser.username} onDismiss={dismissWelcome} />}

        <div className="dash-header">
          <span className="section-eyebrow">My Dashboard</span>
          <h1 className="dash-title">{business?.contact_person || currentUser.username}</h1>
          <p className="dash-subtitle">{business?.name}</p>
        </div>

        {reorderMsg   && <div className="reorder-banner">{reorderMsg}</div>}
        {reorderError && <div className="reorder-banner reorder-banner-error">{reorderError}</div>}

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card stat-card-accent">
            <div className="stat-icon-wrap accent"><IconMoney /></div>
            <div>
              <span className="stat-value">रु{totalSpent.toFixed(0)}</span>
              <span className="stat-label">Total Spent</span>
              {trend && (
                <span className={`stat-trend ${trend.up ? 'trend-up' : 'trend-down'}`}>
                  {trend.up ? '↑' : '↓'} {trend.pct !== null ? `${trend.pct}% vs last month` : 'this month'}
                </span>
              )}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrap"><IconBox /></div>
            <div><span className="stat-value">{totalOrders}</span><span className="stat-label">Total Orders</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrap warning"><IconClock /></div>
            <div><span className="stat-value">{pendingCount}</span><span className="stat-label">Pending</span></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrap success"><IconCheck /></div>
            <div><span className="stat-value">{completedCount}</span><span className="stat-label">Completed</span></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="dash-tabs">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'orders',   label: 'Orders'   },
            { id: 'profile',  label: 'Profile'  },
          ].map(tab => (
            <button key={tab.id} className={`dash-tab${activeTab === tab.id ? ' active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Overview ── */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            {orders.length === 0 ? (
              <div className="dash-card overview-empty-card">
                <div className="overview-empty-icon-wrap"><IconBox /></div>
                <h3>No orders yet</h3>
                <p>Head to the Order page to place your first order.</p>
                <button className="btn-primary-dash" onClick={() => setActivePage('order')}>Place Your First Order</button>
              </div>
            ) : (
              <div className="overview-feed">
                {/* Charts */}
                <div className="charts-row">
                  <div className="dash-card chart-card">
                    <div className="chart-card-header">
                      <h3>Monthly Spending</h3>
                      <p className="chart-subtitle">Last 6 months · excl. cancelled</p>
                    </div>
                    <SpendingChart orders={orders} />
                  </div>
                  <div className="dash-card chart-card">
                    <div className="chart-card-header">
                      <h3>Top Flavours</h3>
                      <p className="chart-subtitle">By quantity ordered</p>
                    </div>
                    <FlavourDonut orders={orders} />
                  </div>
                </div>

                <QuickReorderWidget orders={orders} onReorder={handleReorder} />

                <div className="dash-card">
                  <div className="dash-card-header">
                    <h3>Recent Orders</h3>
                    <button className="link-btn" onClick={() => setActiveTab('orders')}>View all</button>
                  </div>
                  <div className="recent-orders-list">
                    {orders.slice(0, 3).map(order => (
                      <div key={order.id} className="recent-order-row">
                        <div className="recent-order-info">
                          <span className="recent-order-id">#{order.id}</span>
                          <span className="recent-order-date">{new Date(order.order_date).toLocaleDateString()}</span>
                        </div>
                        <div className="recent-order-right">
                          <StatusBadge status={order.status} />
                          <span className="recent-order-total">रु{parseFloat(order.total_amount).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Orders ── */}
        {activeTab === 'orders' && (
          <div className="tab-content">
            <div className="filter-bar">
              {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => (
                <button key={s} className={`filter-btn filter-${s.toLowerCase()}${filterStatus === s ? ' active' : ''}`} onClick={() => setFilterStatus(s)}>
                  {s}<span className="filter-count">{filterCounts[s]}</span>
                </button>
              ))}
            </div>
            {filteredOrders.length === 0 ? (
              <div className="empty-state large">
                <p>{filterStatus === 'All' ? 'No orders yet.' : `No ${filterStatus.toLowerCase()} orders.`}</p>
              </div>
            ) : (
              <div className="orders-list">
                {filteredOrders.map(order => (
                  <OrderCard key={order.id} order={order} onReorder={handleReorder} onCancel={handleCancel} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Profile ── */}
        {activeTab === 'profile' && (
          <div className="tab-content">
            <div className="dash-card profile-card">
              <div className="dash-card-header">
                <h3>Business Details</h3>
                <p className="profile-edit-hint">Edit via the account menu in the top-right bar</p>
              </div>
              <div className="profile-detail-grid">
                {profileFields.map(({ label, value, icon }) => (
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