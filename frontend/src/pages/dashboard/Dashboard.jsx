import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const API_BASE = 'http://localhost:8000/api';

// ─────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    Pending:   { color: 'badge-pending',   icon: '⏳' },
    Confirmed: { color: 'badge-confirmed', icon: '✅' },
    Completed: { color: 'badge-completed', icon: '🎉' },
    Cancelled: { color: 'badge-cancelled', icon: '❌' },
  };
  const { color, icon } = map[status] || { color: '', icon: '•' };
  return (
    <span className={`status-badge ${color}`}>
      {icon} {status}
    </span>
  );
};

// ─────────────────────────────────────────────
// Edit Profile Modal
// ─────────────────────────────────────────────
const EditProfileModal = ({ business, userId, onClose, onSave }) => {
  const [form,    setForm]    = useState({
    name:           business?.name           || '',
    contact_person: business?.contact_person || '',
    phone:          business?.phone          || '',
    email:          business?.email          || '',
    address:        business?.address        || '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const update = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`${API_BASE}/auth/me/update`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': userId },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        onSave(data);
        onClose();
      } else {
        setError(data.error || 'Update failed.');
      }
    } catch {
      setError('Cannot reach server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dash-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dash-modal">
        <button className="dash-modal-close" onClick={onClose}>✕</button>
        <h2 className="dash-modal-title">✏️ Edit Business Profile</h2>

        <form onSubmit={handleSave} className="edit-form">
          <div className="edit-grid">
            <div className="edit-field full">
              <label>Business Name *</label>
              <input type="text" required value={form.name} onChange={update('name')}
                placeholder="Your business name" />
            </div>
            <div className="edit-field">
              <label>Contact Person</label>
              <input type="text" value={form.contact_person} onChange={update('contact_person')}
                placeholder="Your full name" />
            </div>
            <div className="edit-field">
              <label>Phone</label>
              <input type="tel" value={form.phone} onChange={update('phone')}
                placeholder="98XXXXXXXX" />
            </div>
            <div className="edit-field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={update('email')}
                placeholder="business@email.com" />
            </div>
            <div className="edit-field">
              <label>Address</label>
              <input type="text" value={form.address} onChange={update('address')}
                placeholder="Street, Ward, City" />
            </div>
          </div>

          {error && <p className="edit-error">{error}</p>}

          <div className="edit-actions">
            <button type="button" className="btn-ghost-dash" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Order History Card
// ─────────────────────────────────────────────
const OrderCard = ({ order, onReorder }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="order-hist-card">
      <div className="order-hist-header" onClick={() => setExpanded(e => !e)}>
        <div className="order-hist-left">
          <span className="order-hist-id">Order #{order.id}</span>
          <span className="order-hist-date">
            {new Date(order.order_date).toLocaleDateString('en-NP', {
              day: 'numeric', month: 'short', year: 'numeric'
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
          <div className="order-hist-footer">
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
// Dashboard
// ─────────────────────────────────────────────
const Dashboard = ({ currentUser, setActivePage, onLogout }) => {
  const [profile,     setProfile]     = useState(null);
  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showEdit,    setShowEdit]    = useState(false);
  const [reorderMsg,  setReorderMsg]  = useState('');
  const [activeTab,   setActiveTab]   = useState('overview');

  const headers = { 'X-User-Id': currentUser.id };

  // Load profile and orders together
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [meRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE}/auth/me`,           { headers }),
          fetch(`${API_BASE}/orders/my-orders`,  { headers }),
        ]);
        const [meData, ordersData] = await Promise.all([meRes.json(), ordersRes.json()]);
        setProfile(meData);
        setOrders(ordersData);
      } catch {
        // silently fail — show empty state
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentUser.id]);

  const handleProfileSave = (updatedUser) => {
    setProfile(updatedUser);
  };

  const handleReorder = async (order) => {
    const payload = {
      business: currentUser.business,
      items:    order.items.map(i => ({
        item_name: i.item_name,
        quantity:  i.quantity,
        price:     parseFloat(i.price),
      })),
    };

    try {
      const res = await fetch(`${API_BASE}/orders/place`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': currentUser.id },
        body:    JSON.stringify(payload),
      });

      if (res.ok) {
        const newOrder = await res.json();
        setOrders(prev => [newOrder, ...prev]);
        setReorderMsg(`✅ Reorder placed! Order #${newOrder.id}`);
        setTimeout(() => setReorderMsg(''), 4000);
      } else {
        alert('Reorder failed. Please try again.');
      }
    } catch {
      alert('Cannot reach server.');
    }
  };

  const business = profile?.business_details;

  // Stats derived from orders
  const totalOrders    = orders.length;
  const totalSpent     = orders.reduce((s, o) => s + parseFloat(o.total_amount), 0);
  const pendingCount   = orders.filter(o => o.status === 'Pending').length;
  const completedCount = orders.filter(o => o.status === 'Completed').length;

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dash-loading">
          <div className="dash-spinner">🍦</div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {/* Header */}
        <div className="dash-header">
          <div className="dash-header-left">
            <span className="section-eyebrow">Welcome back</span>
            <h1 className="dash-title">
              {business?.contact_person || currentUser.username}
            </h1>
            <p className="dash-subtitle">{business?.name}</p>
          </div>
          <div className="dash-header-actions">
            <button className="btn-place-order" onClick={() => setActivePage('order')}>
              🛒 Place New Order
            </button>
          </div>
        </div>

        {/* Reorder success banner */}
        {reorderMsg && (
          <div className="reorder-banner">{reorderMsg}</div>
        )}

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">📦</span>
            <div>
              <span className="stat-value">{totalOrders}</span>
              <span className="stat-label">Total Orders</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">💰</span>
            <div>
              <span className="stat-value">रु{totalSpent.toFixed(0)}</span>
              <span className="stat-label">Total Spent</span>
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

        {/* Tabs */}
        <div className="dash-tabs">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'orders',   label: '📦 Order History' },
            { id: 'profile',  label: '🏢 Business Profile' },
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="overview-grid">
              {/* Recent orders */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <h3>Recent Orders</h3>
                  <button className="link-btn" onClick={() => setActiveTab('orders')}>
                    View all →
                  </button>
                </div>
                {orders.length === 0 ? (
                  <div className="empty-state">
                    <span>🍦</span>
                    <p>No orders yet. Place your first order!</p>
                    <button className="btn-place-order" onClick={() => setActivePage('order')}>
                      Order Now
                    </button>
                  </div>
                ) : (
                  <div className="recent-orders-list">
                    {orders.slice(0, 3).map(order => (
                      <div key={order.id} className="recent-order-row">
                        <div>
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
                )}
              </div>

              {/* Profile summary */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <h3>Business Profile</h3>
                  <button className="link-btn" onClick={() => setShowEdit(true)}>
                    Edit →
                  </button>
                </div>
                <div className="profile-summary">
                  {[
                    { label: 'Business',  value: business?.name },
                    { label: 'Contact',   value: business?.contact_person },
                    { label: 'Phone',     value: business?.phone },
                    { label: 'Email',     value: business?.email },
                    { label: 'Address',   value: business?.address },
                  ].map(({ label, value }) => (
                    <div key={label} className="profile-row">
                      <span className="profile-label">{label}</span>
                      <span className="profile-value">{value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="tab-content">
            {orders.length === 0 ? (
              <div className="empty-state large">
                <span>📦</span>
                <p>You haven't placed any orders yet.</p>
                <button className="btn-place-order" onClick={() => setActivePage('order')}>
                  Place Your First Order
                </button>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <OrderCard key={order.id} order={order} onReorder={handleReorder} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="tab-content">
            <div className="dash-card profile-card">
              <div className="dash-card-header">
                <h3>🏢 Business Details</h3>
                <button className="btn-edit-profile" onClick={() => setShowEdit(true)}>
                  ✏️ Edit Profile
                </button>
              </div>
              <div className="profile-detail-grid">
                {[
                  { label: 'Business Name',   value: business?.name,           icon: '🏢' },
                  { label: 'Contact Person',  value: business?.contact_person, icon: '👤' },
                  { label: 'Phone',           value: business?.phone,          icon: '📞' },
                  { label: 'Email',           value: business?.email,          icon: '✉️' },
                  { label: 'Address',         value: business?.address,        icon: '📍' },
                  { label: 'Member Since',    value: business?.created_at
                    ? new Date(business.created_at).toLocaleDateString()
                    : '—',                                                      icon: '📅' },
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

      {/* Edit Profile Modal */}
      {showEdit && (
        <EditProfileModal
          business={business}
          userId={currentUser.id}
          onClose={() => setShowEdit(false)}
          onSave={handleProfileSave}
        />
      )}
    </div>
  );
};

export default Dashboard;