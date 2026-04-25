import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../../api';
import './Admin.css';

const IconMoney  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const IconCal    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconBox    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>;
const IconClock  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconCheck  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconHome   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconSearch = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconX      = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconPin    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconChevronRight = ({ open }) => <svg className={`expand-chevron${open ? ' open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IconImage  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;

const AdminSkeleton = () => (
  <div className="admin-container">
    <div style={{ marginBottom: 32 }}>
      <div className="skeleton" style={{ width: 120, height: 14, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: 220, height: 36 }} />
    </div>
    <div className="admin-stats-grid">
      {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton admin-skeleton-card" />)}
    </div>
    <div className="skeleton" style={{ width: '100%', height: 260, borderRadius: 20, marginTop: 24 }} />
    <div className="skeleton" style={{ width: '100%', height: 400, borderRadius: 20, marginTop: 16 }} />
  </div>
);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const buildRevenueData = (orders) => {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const m = d.getMonth(), y = d.getFullYear();
    const revenue = orders
      .filter(o => { const od = new Date(o.order_date); return od.getMonth() === m && od.getFullYear() === y && o.status !== 'Cancelled'; })
      .reduce((s, o) => s + parseFloat(o.total_amount), 0);
    const count = orders.filter(o => { const od = new Date(o.order_date); return od.getMonth() === m && od.getFullYear() === y; }).length;
    return { month: MONTHS[m], revenue: Math.round(revenue), orders: count };
  });
};

const LineTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontFamily: 'DM Sans', fontSize: '0.88rem', fontWeight: 600, color: p.color, margin: '2px 0' }}>
          {p.name === 'revenue' ? `रु${p.value.toLocaleString()}` : `${p.value} orders`}
        </p>
      ))}
    </div>
  );
};

const RevenueChart = ({ orders }) => {
  const data = useMemo(() => buildRevenueData(orders), [orders]);
  if (!data.some(d => d.revenue > 0)) return <div className="chart-empty">No revenue data yet</div>;
  return (
    <ResponsiveContainer width="100%" height={190}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontFamily: 'DM Sans', fontSize: 11, fill: 'var(--text-muted)' }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontFamily: 'DM Sans', fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
        <Tooltip content={<LineTooltip />} />
        <Line type="monotone" dataKey="revenue" stroke="var(--accent-primary)" strokeWidth={2.5}
          dot={{ r: 4, fill: 'var(--accent-primary)', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} name="revenue" />
      </LineChart>
    </ResponsiveContainer>
  );
};

const STATUS_COLORS = { Pending: '#f97316', Confirmed: '#3b82f6', Completed: '#22c55e', Cancelled: '#ef4444' };

const StatusTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{payload[0].name}</p>
      <p className="chart-tooltip-value">{payload[0].value} orders</p>
    </div>
  );
};

const StatusDonut = ({ orders }) => {
  const data = useMemo(() => {
    const counts = { Pending: 0, Confirmed: 0, Completed: 0, Cancelled: 0 };
    orders.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++; });
    return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [orders]);
  if (!data.length) return <div className="chart-empty">No order data yet</div>;
  return (
    <ResponsiveContainer width="100%" height={190}>
      <PieChart>
        <Pie data={data} cx="50%" cy="44%" innerRadius={50} outerRadius={74} paddingAngle={3} dataKey="value" strokeWidth={0}>
          {data.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />)}
        </Pie>
        <Tooltip content={<StatusTooltip />} />
        <Legend iconType="circle" iconSize={7} formatter={value => <span style={{ fontFamily: 'DM Sans', fontSize: '11px', color: 'var(--text-secondary)' }}>{value}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
};

const StatusChanger = ({ order, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleChange = async (newStatus) => {
    if (newStatus === order.status) return;
    setLoading(true); setError('');
    try {
      const updated = await api.patch(`/orders/${order.id}/status`, { status: newStatus });
      onUpdate(updated);
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="status-changer">
      <select className={`status-select status-select-${order.status.toLowerCase()}`} value={order.status} onChange={e => handleChange(e.target.value)} disabled={loading}>
        {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      {loading && <span className="status-spinner-dot" />}
      {error   && <span className="status-error">{error}</span>}
    </div>
  );
};

/* Payment screenshot lightbox */
const PaymentLightbox = ({ url, onClose }) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="pay-lightbox-overlay" onClick={onClose}>
      <div className="pay-lightbox-box" onClick={e => e.stopPropagation()}>
        <button className="pay-lightbox-close" onClick={onClose}><IconX /></button>
        <img src={url} alt="Payment screenshot" className="pay-lightbox-img" />
      </div>
    </div>
  );
};

const OrderRow = ({ order, onUpdate }) => {
  const [expanded,    setExpanded]    = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);

  /* payment_screenshot_url expected from API if customer uploaded one */
  const paymentUrl = order.payment_screenshot_url || null;

  return (
    <>
      <tr className={`order-table-row${expanded ? ' expanded' : ''}`}>
        <td className="td-id">
          <button className="expand-btn" onClick={() => setExpanded(e => !e)}>
            <IconChevronRight open={expanded} />
            #{order.id}
          </button>
        </td>
        <td className="td-business"><span className="business-name">{order.business_name || '—'}</span></td>
        <td className="td-date">{new Date(order.order_date).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
        <td className="td-items">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
        <td className="td-total"><span className="total-cell">रु{parseFloat(order.total_amount).toFixed(2)}</span></td>
        <td className="td-payment">
          {paymentUrl ? (
            <button className="pay-thumb-btn" onClick={() => setLightboxUrl(paymentUrl)} title="View payment screenshot">
              <IconImage /> View
            </button>
          ) : (
            <span className="pay-none-label">No receipt</span>
          )}
        </td>
        <td className="td-status"><StatusChanger order={order} onUpdate={onUpdate} /></td>
      </tr>
      {expanded && (
        <tr className="order-detail-row">
          <td colSpan={7}>
            <div className="order-detail-panel">
              {/* payment section */}
              {paymentUrl && (
                <div className="admin-payment-section">
                  <p className="admin-payment-label">Payment Screenshot</p>
                  <img
                    src={paymentUrl}
                    alt="Payment proof"
                    className="admin-payment-thumb"
                    onClick={() => setLightboxUrl(paymentUrl)}
                  />
                </div>
              )}
              {order.payment_done && (
                <div className="admin-payment-badge">
                  <IconCheck /> Payment Confirmed by Customer
                </div>
              )}
              <div className="detail-items-header"><span>Flavour</span><span>Qty</span><span>Unit Price</span><span>Subtotal</span></div>
              {order.items.map((item, i) => (
                <div key={i} className="detail-item-row">
                  <span>{item.item_name}</span>
                  <span>x {item.quantity}</span>
                  <span>रु{parseFloat(item.price).toFixed(2)}</span>
                  <span className="detail-subtotal">रु{parseFloat(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
              <div className="detail-total-row">
                <span>Order Total</span>
                <span className="detail-grand-total">रु{parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </td>
        </tr>
      )}
      {lightboxUrl && <PaymentLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />}
    </>
  );
};

const AdminLogTab = () => {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.get('/admin/logs/')
      .then(data => setLogs(data))
      .catch(err  => setError(err.message || 'Could not load logs.'))
      .finally(()  => setLoading(false));
  }, []);

  if (loading) return <div className="log-loading">{[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 48, borderRadius: 12, marginBottom: 8 }} />)}</div>;
  if (error)   return <div className="admin-empty"><p>{error}</p></div>;
  if (!logs.length) return <div className="admin-empty"><p>No activity logged yet.</p></div>;

  return (
    <div className="admin-log-list">
      {logs.map((log, i) => (
        <div key={i} className="log-entry">
          <div className="log-entry-left">
            <div className="log-dot"><IconPin /></div>
            <div>
              <p className="log-action">{log.action}</p>
              <p className="log-admin">by {log.admin_username || log.admin_user}</p>
            </div>
          </div>
          <span className="log-time">{new Date(log.action_time).toLocaleString('en-NP', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      ))}
    </div>
  );
};

/* BUG FIX: useEffect was called after a conditional return violating rules of hooks.
   All hooks are now declared at the top before any early returns. */
const Admin = ({ currentUser, setActivePage }) => {
  const [stats,        setStats]        = useState(null);
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [loadError,    setLoadError]    = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [sortBy,       setSortBy]       = useState('date_desc');
  const [activeTab,    setActiveTab]    = useState('orders');

  /* hooks must run unconditionally */
  useEffect(() => {
    if (currentUser.role !== 'ADMIN') return;
    const load = async () => {
      setLoading(true); setLoadError('');
      try {
        const [s, o] = await Promise.all([api.get('/admin/stats/'), api.get('/orders/')]);
        setStats(s); setOrders(o);
      } catch (err) { setLoadError(err.message || 'Failed to load admin data.'); }
      finally { setLoading(false); }
    };
    load();
  }, [currentUser.role]);

  const handleOrderUpdate = (updatedOrder) =>
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));

  const filterCounts = useMemo(() => ({
    All:       orders.length,
    Pending:   orders.filter(o => o.status === 'Pending').length,
    Confirmed: orders.filter(o => o.status === 'Confirmed').length,
    Completed: orders.filter(o => o.status === 'Completed').length,
    Cancelled: orders.filter(o => o.status === 'Cancelled').length,
  }), [orders]);

  const displayedOrders = useMemo(() => {
    let result = filterStatus === 'All' ? orders : orders.filter(o => o.status === filterStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o =>
        String(o.id).includes(q) ||
        (o.business_name || '').toLowerCase().includes(q) ||
        o.items.some(i => i.item_name.toLowerCase().includes(q))
      );
    }
    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':  return new Date(b.order_date) - new Date(a.order_date);
        case 'date_asc':   return new Date(a.order_date) - new Date(b.order_date);
        case 'total_desc': return parseFloat(b.total_amount) - parseFloat(a.total_amount);
        case 'total_asc':  return parseFloat(a.total_amount) - parseFloat(b.total_amount);
        default: return 0;
      }
    });
  }, [orders, filterStatus, searchQuery, sortBy]);

  /* access guard after all hooks */
  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="admin-page">
        <div className="admin-access-denied">
          <h2>Access Denied</h2>
          <p>This area is for admins only.</p>
          <button className="btn-admin-back" onClick={() => setActivePage('home')}><IconHome /> Go Home</button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="admin-page"><AdminSkeleton /></div>;

  if (loadError) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="admin-load-error">
            <p>{loadError}</p>
            <button className="btn-admin-back" onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  const statCards = stats ? [
    { label: 'Revenue This Month', value: `रु${stats.revenue_month.toLocaleString()}`, variant: 'accent',   icon: <IconMoney /> },
    { label: 'Revenue Today',      value: `रु${stats.revenue_today.toLocaleString()}`,               icon: <IconCal />   },
    { label: 'Total Orders',       value: stats.total_orders,                                         icon: <IconBox />   },
    { label: 'Pending',            value: stats.pending_count,   variant: 'warning',                  icon: <IconClock /> },
    { label: 'Confirmed',          value: stats.confirmed_count,                                      icon: <IconCheck /> },
    { label: 'Businesses',         value: stats.total_businesses,                                     icon: <IconHome />  },
  ] : [];

  return (
    <div className="admin-page">
      <div className="admin-container">

        <div className="admin-header">
          <div>
            <span className="section-eyebrow">Admin Panel</span>
            <h1 className="admin-title">Operations Dashboard</h1>
          </div>
          <span className="admin-badge">Admin</span>
        </div>

        {stats && (
          <div className="admin-stats-grid">
            {statCards.map(({ label, value, variant, icon }) => (
              <div key={label} className={`admin-stat-card${variant ? ` ${variant}` : ''}`}>
                <div className={`admin-stat-icon-wrap${variant ? ` ${variant}` : ''}`}>{icon}</div>
                <div>
                  <span className="admin-stat-value">{value}</span>
                  <span className="admin-stat-label">{label}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {orders.length > 0 && (
          <div className="admin-charts-row">
            <div className="admin-chart-card">
              <div className="admin-chart-header">
                <h3>Revenue Trend</h3>
                <p className="chart-subtitle">Last 6 months excl. cancelled</p>
              </div>
              <RevenueChart orders={orders} />
            </div>
            <div className="admin-chart-card">
              <div className="admin-chart-header">
                <h3>Order Status</h3>
                <p className="chart-subtitle">All-time breakdown</p>
              </div>
              <StatusDonut orders={orders} />
            </div>
          </div>
        )}

        <div className="admin-tabs">
          {[
            { id: 'orders', label: 'Orders'       },
            { id: 'logs',   label: 'Activity Log' },
          ].map(tab => (
            <button key={tab.id} className={`admin-tab${activeTab === tab.id ? ' active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'orders' && (
          <div className="admin-orders-section">
            <div className="admin-toolbar">
              <div className="admin-search-wrap">
                <span className="search-icon-svg"><IconSearch /></span>
                <input type="text" className="admin-search"
                  placeholder="Search by order ID, business, or flavour"
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                {searchQuery && (
                  <button className="search-clear" onClick={() => setSearchQuery('')}><IconX /></button>
                )}
              </div>
              <select className="admin-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="date_desc">Newest first</option>
                <option value="date_asc">Oldest first</option>
                <option value="total_desc">Highest total</option>
                <option value="total_asc">Lowest total</option>
              </select>
            </div>

            <div className="filter-bar">
              {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => (
                <button key={s} className={`filter-btn filter-${s.toLowerCase()}${filterStatus === s ? ' active' : ''}`} onClick={() => setFilterStatus(s)}>
                  {s}<span className="filter-count">{filterCounts[s]}</span>
                </button>
              ))}
            </div>

            {displayedOrders.length === 0 ? (
              <div className="admin-empty">
                <p>{searchQuery ? `No orders match "${searchQuery}"` : filterStatus === 'All' ? 'No orders yet.' : `No ${filterStatus.toLowerCase()} orders.`}</p>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Order</th><th>Business</th><th>Date</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
                  <tbody>{displayedOrders.map(order => <OrderRow key={order.id} order={order} onUpdate={handleOrderUpdate} />)}</tbody>
                </table>
              </div>
            )}

            {displayedOrders.length > 0 && (
              <p className="admin-result-count">Showing {displayedOrders.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}</p>
            )}
          </div>
        )}

        {activeTab === 'logs' && <AdminLogTab />}

      </div>
    </div>
  );
};

export default Admin;