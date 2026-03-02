import React, { useState, useEffect, useMemo } from 'react';
import './Admin.css';

const API_BASE = 'http://localhost:8000/api';

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────
const AdminSkeleton = () => (
  <div className="admin-container">
    <div style={{ marginBottom: 32 }}>
      <div className="skeleton" style={{ width: 120, height: 14, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: 220, height: 36 }} />
    </div>
    <div className="admin-stats-grid">
      {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton admin-skeleton-card" />)}
    </div>
    <div className="skeleton" style={{ width: '100%', height: 400, borderRadius: 20, marginTop: 24 }} />
  </div>
);

// ─────────────────────────────────────────────
// Status Badge
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
// Inline status changer
// ─────────────────────────────────────────────
const StatusChanger = ({ order, adminUser, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

  const handleChange = async (newStatus) => {
    if (newStatus === order.status) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/orders/${order.id}/status`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': adminUser.id },
        body:    JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdate(updated);
      } else {
        const data = await res.json();
        setError(data.error || 'Update failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="status-changer">
      <select
        className={`status-select status-select-${order.status.toLowerCase()}`}
        value={order.status}
        onChange={e => handleChange(e.target.value)}
        disabled={loading}
      >
        {STATUSES.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      {loading && <span className="status-spinner">⏳</span>}
      {error   && <span className="status-error">{error}</span>}
    </div>
  );
};

// ─────────────────────────────────────────────
// Expandable order row
// ─────────────────────────────────────────────
const OrderRow = ({ order, adminUser, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className={`order-table-row${expanded ? ' expanded' : ''}`}>
        <td className="td-id">
          <button className="expand-btn" onClick={() => setExpanded(e => !e)}>
            <span className={`expand-chevron${expanded ? ' open' : ''}`}>›</span>
            #{order.id}
          </button>
        </td>
        <td className="td-business">
          <span className="business-name">{order.business_name || '—'}</span>
        </td>
        <td className="td-date">
          {new Date(order.order_date).toLocaleDateString('en-NP', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </td>
        <td className="td-items">
          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
        </td>
        <td className="td-total">
          <span className="total-cell">रु{parseFloat(order.total_amount).toFixed(2)}</span>
        </td>
        <td className="td-status">
          <StatusChanger order={order} adminUser={adminUser} onUpdate={onUpdate} />
        </td>
      </tr>

      {expanded && (
        <tr className="order-detail-row">
          <td colSpan={6}>
            <div className="order-detail-panel">
              <div className="order-detail-items">
                <div className="detail-items-header">
                  <span>Flavour</span>
                  <span>Qty</span>
                  <span>Unit Price</span>
                  <span>Subtotal</span>
                </div>
                {order.items.map((item, i) => (
                  <div key={i} className="detail-item-row">
                    <span>{item.item_name}</span>
                    <span>× {item.quantity}</span>
                    <span>रु{parseFloat(item.price).toFixed(2)}</span>
                    <span className="detail-subtotal">
                      रु{parseFloat(item.subtotal).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="detail-total-row">
                <span>Order Total</span>
                <span className="detail-grand-total">
                  रु{parseFloat(order.total_amount).toFixed(2)}
                </span>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ─────────────────────────────────────────────
// Admin Dashboard
// ─────────────────────────────────────────────
const Admin = ({ currentUser, setActivePage }) => {
  const [stats,         setStats]         = useState(null);
  const [orders,        setOrders]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [filterStatus,  setFilterStatus]  = useState('All');
  const [searchQuery,   setSearchQuery]   = useState('');
  const [sortBy,        setSortBy]        = useState('date_desc');
  const [activeTab,     setActiveTab]     = useState('orders');

  const headers = { 'X-User-Id': currentUser.id };

  // Guard — redirect non-admins
  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="admin-page">
        <div className="admin-access-denied">
          <span>🚫</span>
          <h2>Access Denied</h2>
          <p>This area is for admins only.</p>
          <button className="btn-admin-back" onClick={() => setActivePage('home')}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [statsRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE}/admin/stats/`,  { headers }),
          fetch(`${API_BASE}/orders/`,       { headers }),
        ]);
        const [s, o] = await Promise.all([statsRes.json(), ordersRes.json()]);
        setStats(s);
        setOrders(o);
      } catch { /* show empty state */ }
      finally  { setLoading(false); }
    };
    load();
  }, []);

  const handleOrderUpdate = (updatedOrder) => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  // Derived filter counts
  const filterCounts = useMemo(() => ({
    All:       orders.length,
    Pending:   orders.filter(o => o.status === 'Pending').length,
    Confirmed: orders.filter(o => o.status === 'Confirmed').length,
    Completed: orders.filter(o => o.status === 'Completed').length,
    Cancelled: orders.filter(o => o.status === 'Cancelled').length,
  }), [orders]);

  // Filter + search + sort
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

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'date_desc': return new Date(b.order_date) - new Date(a.order_date);
        case 'date_asc':  return new Date(a.order_date) - new Date(b.order_date);
        case 'total_desc': return parseFloat(b.total_amount) - parseFloat(a.total_amount);
        case 'total_asc':  return parseFloat(a.total_amount) - parseFloat(b.total_amount);
        default: return 0;
      }
    });

    return result;
  }, [orders, filterStatus, searchQuery, sortBy]);

  if (loading) return <div className="admin-page"><AdminSkeleton /></div>;

  return (
    <div className="admin-page">
      <div className="admin-container">

        {/* Header */}
        <div className="admin-header">
          <div>
            <span className="section-eyebrow">Admin Panel</span>
            <h1 className="admin-title">Operations Dashboard</h1>
          </div>
          <div className="admin-header-badge">
            <span className="admin-badge">👑 Admin</span>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="admin-stats-grid">
            <div className="admin-stat-card accent">
              <span className="admin-stat-icon">💰</span>
              <div>
                <span className="admin-stat-value">
                  रु{stats.revenue_month.toLocaleString()}
                </span>
                <span className="admin-stat-label">Revenue This Month</span>
              </div>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-icon">📅</span>
              <div>
                <span className="admin-stat-value">
                  रु{stats.revenue_today.toLocaleString()}
                </span>
                <span className="admin-stat-label">Revenue Today</span>
              </div>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-icon">📦</span>
              <div>
                <span className="admin-stat-value">{stats.total_orders}</span>
                <span className="admin-stat-label">Total Orders</span>
              </div>
            </div>
            <div className="admin-stat-card warning">
              <span className="admin-stat-icon">⏳</span>
              <div>
                <span className="admin-stat-value">{stats.pending_count}</span>
                <span className="admin-stat-label">Pending</span>
              </div>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-icon">✅</span>
              <div>
                <span className="admin-stat-value">{stats.confirmed_count}</span>
                <span className="admin-stat-label">Confirmed</span>
              </div>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-icon">🏢</span>
              <div>
                <span className="admin-stat-value">{stats.total_businesses}</span>
                <span className="admin-stat-label">Businesses</span>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="admin-tabs">
          {[
            { id: 'orders', label: '📦 Orders' },
            { id: 'logs',   label: '📋 Activity Log' },
          ].map(tab => (
            <button
              key={tab.id}
              className={`admin-tab${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Orders Tab ── */}
        {activeTab === 'orders' && (
          <div className="admin-orders-section">
            {/* Toolbar */}
            <div className="admin-toolbar">
              <div className="admin-search-wrap">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="admin-search"
                  placeholder="Search by order ID, business, or flavour…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
                )}
              </div>
              <select
                className="admin-sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="date_desc">Newest first</option>
                <option value="date_asc">Oldest first</option>
                <option value="total_desc">Highest total</option>
                <option value="total_asc">Lowest total</option>
              </select>
            </div>

            {/* Filter bar */}
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

            {/* Table */}
            {displayedOrders.length === 0 ? (
              <div className="admin-empty">
                <span>📦</span>
                <p>
                  {searchQuery
                    ? `No orders match "${searchQuery}"`
                    : filterStatus === 'All'
                      ? 'No orders yet.'
                      : `No ${filterStatus.toLowerCase()} orders.`}
                </p>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Business</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedOrders.map(order => (
                      <OrderRow
                        key={order.id}
                        order={order}
                        adminUser={currentUser}
                        onUpdate={handleOrderUpdate}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {displayedOrders.length > 0 && (
              <p className="admin-result-count">
                Showing {displayedOrders.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* ── Activity Log Tab ── */}
        {activeTab === 'logs' && (
          <AdminLogTab adminUser={currentUser} />
        )}

      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Activity Log Tab (lazy loaded)
// ─────────────────────────────────────────────
const AdminLogTab = ({ adminUser }) => {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/admin/logs/`, { headers: { 'X-User-Id': adminUser.id } })
      .then(r => r.json())
      .then(data => setLogs(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="log-loading">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="skeleton" style={{ height: 48, borderRadius: 12, marginBottom: 8 }} />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="admin-empty">
        <span>📋</span>
        <p>No activity logged yet.</p>
      </div>
    );
  }

  return (
    <div className="admin-log-list">
      {logs.map((log, i) => (
        <div key={i} className="log-entry">
          <div className="log-entry-left">
            <span className="log-icon">📌</span>
            <div>
              <p className="log-action">{log.action}</p>
              <p className="log-admin">by {log.admin_username || log.admin_user}</p>
            </div>
          </div>
          <span className="log-time">
            {new Date(log.timestamp).toLocaleString('en-NP', {
              day: 'numeric', month: 'short',
              hour: '2-digit', minute: '2-digit',
            })}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Admin;