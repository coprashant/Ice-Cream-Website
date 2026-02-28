import React, { useState, useEffect } from 'react';
import { flavourData, getPriceByName } from '../../data/flavours';
import './Order.css';

const API_BASE = 'http://localhost:8000/api';

// ─────────────────────────────────────────────
// Single flavour row in the order form
// ─────────────────────────────────────────────
const OrderRow = ({ row, index, onUpdate, onRemove, showRemove }) => {
  const handleFlavourChange = (e) => {
    const name  = e.target.value;
    const price = getPriceByName(name);
    onUpdate(index, { ...row, flavour: name, price });
  };

  const handleQtyChange = (e) => {
    onUpdate(index, { ...row, qty: Math.max(1, parseInt(e.target.value) || 1) });
  };

  const subtotal = row.price * row.qty;

  return (
    <div className="order-row">
      <div className="order-row-select">
        <label className="field-label">Flavour</label>
        <select value={row.flavour} onChange={handleFlavourChange} className="select-field" required>
          <option value="" disabled>Select a flavour...</option>
          {Object.entries(flavourData).map(([category, items]) => (
            <optgroup key={category} label={category}>
              {items.map(item => (
                <option key={item.name} value={item.name}>
                  {item.emoji} {item.name} — रु{item.price}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="order-row-qty">
        <label className="field-label">Qty</label>
        <div className="qty-control">
          <button type="button" className="qty-btn"
            onClick={() => onUpdate(index, { ...row, qty: Math.max(1, row.qty - 1) })}>−</button>
          <input type="number" value={row.qty} onChange={handleQtyChange}
            min="1" className="qty-input" required />
          <button type="button" className="qty-btn"
            onClick={() => onUpdate(index, { ...row, qty: row.qty + 1 })}>+</button>
        </div>
      </div>

      <div className="order-row-subtotal">
        <label className="field-label">Subtotal</label>
        <span className="subtotal-value">{row.flavour ? `रु${subtotal}` : '—'}</span>
      </div>

      {showRemove && (
        <button type="button" className="remove-btn" onClick={() => onRemove(index)}>✕</button>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Login form
// ─────────────────────────────────────────────
const LoginForm = ({ onLoginSuccess, onGoToRegister }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(credentials),
      });

      if (response.ok) {
        const user = await response.json();
        localStorage.setItem('userId',     user.id);
        localStorage.setItem('businessId', user.business ?? '');
        localStorage.setItem('userRole',   user.role);
        onLoginSuccess(user);
      } else {
        setError('Invalid username or password.');
      }
    } catch {
      setError('Cannot reach server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-page">
      <div className="order-container">
        <div className="order-header">
          <span className="section-eyebrow">Welcome Back</span>
          <h1 className="order-title">Sign In to Order</h1>
          <p className="order-sub">Log in with your business account to place an order.</p>
        </div>

        <div className="order-card" style={{ maxWidth: 400, margin: '0 auto' }}>
          <form onSubmit={handleLogin}>
            <div className="field-group">
              <label className="field-label">Username</label>
              <input type="text" className="input-field" placeholder="Your username"
                value={credentials.username}
                onChange={(e) => setCredentials(p => ({ ...p, username: e.target.value }))}
                required />
            </div>
            <div className="field-group" style={{ marginTop: 16 }}>
              <label className="field-label">Password</label>
              <input type="password" className="input-field" placeholder="Your password"
                value={credentials.password}
                onChange={(e) => setCredentials(p => ({ ...p, password: e.target.value }))}
                required />
            </div>

            {error && <p className="error-msg" style={{ marginTop: 12 }}>{error}</p>}

            <button type="submit" className="btn-primary"
              style={{ marginTop: 20, width: '100%' }} disabled={loading}>
              {loading ? '⏳ Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#888' }}>
            New business?{' '}
            <button onClick={onGoToRegister}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary, #e91e8c)', fontWeight: 600 }}>
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Register form
// ─────────────────────────────────────────────
const RegisterForm = ({ onRegisterSuccess, onGoToLogin }) => {
  const [form,    setForm]    = useState({ username: '', password: '', business_name: '', phone: '', email: '', address: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });

      if (response.ok) {
        const user = await response.json();
        localStorage.setItem('userId',     user.id);
        localStorage.setItem('businessId', user.business ?? '');
        localStorage.setItem('userRole',   user.role);
        onRegisterSuccess(user);
      } else {
        const data = await response.json();
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Cannot reach server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  return (
    <div className="order-page">
      <div className="order-container">
        <div className="order-header">
          <span className="section-eyebrow">Get Started</span>
          <h1 className="order-title">Register Your Business</h1>
          <p className="order-sub">Create an account to start placing orders.</p>
        </div>

        <div className="order-card" style={{ maxWidth: 480, margin: '0 auto' }}>
          <form onSubmit={handleRegister}>
            <h3 className="card-title" style={{ marginBottom: 16 }}>🔐 Account Details</h3>

            <div className="fields-grid">
              <div className="field-group">
                <label className="field-label">Username *</label>
                <input type="text" className="input-field" placeholder="Choose a username"
                  value={form.username} onChange={update('username')} required />
              </div>
              <div className="field-group">
                <label className="field-label">Password *</label>
                <input type="password" className="input-field" placeholder="Min. 8 characters"
                  value={form.password} onChange={update('password')} minLength={8} required />
              </div>
            </div>

            <h3 className="card-title" style={{ margin: '20px 0 16px' }}>🏢 Business Details</h3>

            <div className="fields-grid">
              <div className="field-group full-width">
                <label className="field-label">Business Name *</label>
                <input type="text" className="input-field" placeholder="Your business name"
                  value={form.business_name} onChange={update('business_name')} required />
              </div>
              <div className="field-group">
                <label className="field-label">Phone</label>
                <input type="tel" className="input-field" placeholder="98XXXXXXXX"
                  value={form.phone} onChange={update('phone')} />
              </div>
              <div className="field-group">
                <label className="field-label">Email</label>
                <input type="email" className="input-field" placeholder="business@email.com"
                  value={form.email} onChange={update('email')} />
              </div>
              <div className="field-group full-width">
                <label className="field-label">Address</label>
                <input type="text" className="input-field" placeholder="Street, Ward, City"
                  value={form.address} onChange={update('address')} />
              </div>
            </div>

            {error && <p className="error-msg" style={{ marginTop: 12 }}>{error}</p>}

            <button type="submit" className="btn-primary"
              style={{ marginTop: 20, width: '100%' }} disabled={loading}>
              {loading ? '⏳ Creating account...' : '✅ Create Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#888' }}>
            Already have an account?{' '}
            <button onClick={onGoToLogin}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary, #e91e8c)', fontWeight: 600 }}>
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Order preview modal
// ─────────────────────────────────────────────
const PreviewModal = ({ isOpen, onClose, orderRows, customerInfo, total, onConfirm, loading }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-header">
          <span className="modal-icon">🧾</span>
          <h2>Order Summary</h2>
          <p>Please review before confirming</p>
        </div>

        <div className="modal-customer">
          <div className="modal-info-row">
            <span className="modal-info-label">Name</span>
            <span className="modal-info-value">{customerInfo.name}</span>
          </div>
          <div className="modal-info-row">
            <span className="modal-info-label">Phone</span>
            <span className="modal-info-value">{customerInfo.phone}</span>
          </div>
          <div className="modal-info-row">
            <span className="modal-info-label">Address</span>
            <span className="modal-info-value">{customerInfo.address}</span>
          </div>
        </div>

        <div className="modal-items">
          <div className="modal-items-header">
            <span>Item</span><span>Qty × Price</span><span>Total</span>
          </div>
          {orderRows.filter(r => r.flavour).map((row, i) => (
            <div key={i} className="modal-item-row">
              <span>{row.flavour}</span>
              <span>{row.qty} × रु{row.price}</span>
              <span>रु{row.qty * row.price}</span>
            </div>
          ))}
        </div>

        <div className="modal-total">
          <span>Total Amount</span>
          <span className="modal-total-value">रु{total.toFixed(2)}</span>
        </div>

        <button className="btn-confirm" onClick={onConfirm} disabled={loading}>
          {loading ? '⏳ Placing Order...' : '✅ Confirm & Place Order'}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Order page
// ─────────────────────────────────────────────
const Order = () => {
  const [currentUser,  setCurrentUser]  = useState(() => {
    const userId     = localStorage.getItem('userId');
    const businessId = localStorage.getItem('businessId');
    const role       = localStorage.getItem('userRole');
    return userId ? { id: userId, business: businessId, role } : null;
  });

  const [authScreen,   setAuthScreen]   = useState('login'); // 'login' | 'register'
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [orderRows,    setOrderRows]    = useState([{ flavour: '', qty: 1, price: 0 }]);
  const [showModal,    setShowModal]    = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [successMsg,   setSuccessMsg]   = useState('');
  const [errors,       setErrors]       = useState({});

  const total = orderRows.reduce((sum, row) => sum + (row.price * row.qty), 0);

  // Show auth screens if not logged in
  if (!currentUser) {
    if (authScreen === 'register') {
      return (
        <RegisterForm
          onRegisterSuccess={setCurrentUser}
          onGoToLogin={() => setAuthScreen('login')}
        />
      );
    }
    return (
      <LoginForm
        onLoginSuccess={setCurrentUser}
        onGoToRegister={() => setAuthScreen('register')}
      />
    );
  }

  const updateRow = (index, updated) =>
    setOrderRows(prev => prev.map((r, i) => i === index ? updated : r));

  const removeRow = (index) =>
    setOrderRows(prev => prev.filter((_, i) => i !== index));

  const addRow = () =>
    setOrderRows(prev => [...prev, { flavour: '', qty: 1, price: 0 }]);

  const validate = () => {
    const e = {};
    if (!customerInfo.name.trim())                    e.name     = 'Name is required';
    if (!/^9[78][0-9]{8}$/.test(customerInfo.phone)) e.phone    = 'Enter valid Nepali number (98XXXXXXXX)';
    if (!customerInfo.address.trim())                 e.address  = 'Address is required';
    if (!orderRows.some(r => r.flavour))              e.flavours = 'Select at least one flavour';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleReview = () => {
    if (validate()) setShowModal(true);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);

    const payload = {
      business: currentUser.business,
      items: orderRows
        .filter(r => r.flavour)
        .map(r => ({ item_name: r.flavour, quantity: r.qty, price: r.price })),
    };

    try {
      const response = await fetch(`${API_BASE}/orders/place`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': currentUser.id },
        body:    JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        setShowModal(false);
        setSuccessMsg(`🎉 Order placed! Order ID: ${result.id}`);
        setCustomerInfo({ name: '', phone: '', address: '' });
        setOrderRows([{ flavour: '', qty: 1, price: 0 }]);
      } else {
        const errorData = await response.json();
        alert(`Error: ${JSON.stringify(errorData)}`);
      }
    } catch {
      alert('Cannot reach server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('businessId');
    localStorage.removeItem('userRole');
    setCurrentUser(null);
    setAuthScreen('login');
  };

  if (successMsg) {
    return (
      <div className="order-page">
        <div className="success-screen">
          <div className="success-icon">🍦</div>
          <h2>Order Placed!</h2>
          <p>{successMsg}</p>
          <button className="btn-primary" onClick={() => setSuccessMsg('')}>
            Place Another Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-page">
      <div className="order-container">
        <div className="order-header">
          <span className="section-eyebrow">Place Order</span>
          <h1 className="order-title">What would you like?</h1>
          <p className="order-sub">Fill in your details and pick your flavours</p>
          <button onClick={handleLogout}
            style={{ marginTop: 8, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
            Not you? Sign out
          </button>
        </div>

        <div className="order-layout">
          <div className="order-card">
            <h3 className="card-title">📋 Your Details</h3>
            <div className="fields-grid">
              <div className="field-group">
                <label className="field-label">Full Name *</label>
                <input type="text" className={`input-field${errors.name ? ' error' : ''}`}
                  placeholder="e.g. Ramesh Sharma" value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(p => ({ ...p, name: e.target.value }))} />
                {errors.name && <span className="error-msg">{errors.name}</span>}
              </div>

              <div className="field-group">
                <label className="field-label">Phone Number *</label>
                <input type="tel" className={`input-field${errors.phone ? ' error' : ''}`}
                  placeholder="98XXXXXXXX" value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(p => ({ ...p, phone: e.target.value }))} />
                {errors.phone && <span className="error-msg">{errors.phone}</span>}
              </div>

              <div className="field-group full-width">
                <label className="field-label">Delivery Address *</label>
                <input type="text" className={`input-field${errors.address ? ' error' : ''}`}
                  placeholder="Street, Ward, City" value={customerInfo.address}
                  onChange={(e) => setCustomerInfo(p => ({ ...p, address: e.target.value }))} />
                {errors.address && <span className="error-msg">{errors.address}</span>}
              </div>
            </div>
          </div>

          <div className="order-card">
            <h3 className="card-title">🍦 Your Flavours</h3>
            {errors.flavours && <p className="error-msg">{errors.flavours}</p>}
            <div className="order-rows">
              {orderRows.map((row, i) => (
                <OrderRow key={i} row={row} index={i} onUpdate={updateRow}
                  onRemove={removeRow} showRemove={orderRows.length > 1} />
              ))}
            </div>
            <button type="button" className="add-flavour-btn" onClick={addRow}>
              + Add Another Flavour
            </button>
          </div>
        </div>

        <div className="order-bottom-bar">
          <div className="order-total">
            <span className="total-label">Total</span>
            <span className="total-value">रु{total.toFixed(2)}</span>
          </div>
          <button className="btn-primary review-btn" onClick={handleReview}>
            Review & Place Order →
          </button>
        </div>
      </div>

      <PreviewModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        orderRows={orderRows}
        customerInfo={customerInfo}
        total={total}
        onConfirm={handlePlaceOrder}
        loading={loading}
      />
    </div>
  );
};

export default Order;