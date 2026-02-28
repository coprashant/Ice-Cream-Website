import React, { useState, useEffect } from 'react';
import { flavourData, getPriceByName } from '../../data/flavours';
import './Order.css';

const API_BASE = 'http://localhost:8000/api';

// ─────────────────────────────────────────────
// Single flavour row
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
        <span className="subtotal-value">
          {row.flavour ? `रु${row.price * row.qty}` : '—'}
        </span>
      </div>

      {showRemove && (
        <button type="button" className="remove-btn" onClick={() => onRemove(index)}>✕</button>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Preview modal
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
            <span className="modal-info-label">Contact</span>
            <span className="modal-info-value">{customerInfo.contact_person}</span>
          </div>
          <div className="modal-info-row">
            <span className="modal-info-label">Business</span>
            <span className="modal-info-value">{customerInfo.business_name}</span>
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
const Order = ({ currentUser }) => {
  const [profile,    setProfile]    = useState(null);
  const [orderRows,  setOrderRows]  = useState([{ flavour: '', qty: 1, price: 0 }]);
  const [showModal,  setShowModal]  = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errors,     setErrors]     = useState({});

  const total = orderRows.reduce((sum, r) => sum + r.price * r.qty, 0);

  // Load the user's full profile (including business details) on mount
  useEffect(() => {
    if (!currentUser) return;
    fetch(`${API_BASE}/auth/me`, {
      headers: { 'X-User-Id': currentUser.id },
    })
      .then(r => r.json())
      .then(data => setProfile(data))
      .catch(() => {});
  }, [currentUser]);

  // Not logged in — prompt them to use the navbar login
  if (!currentUser) {
    return (
      <div className="order-page">
        <div className="success-screen">
          <div className="success-icon">🔒</div>
          <h2>Login Required</h2>
          <p>Please sign in using the button in the top-right corner to place an order.</p>
        </div>
      </div>
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
    if (!orderRows.some(r => r.flavour)) e.flavours = 'Select at least one flavour';
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
        setSuccessMsg(`🎉 Order placed! Order ID: #${result.id}`);
        setOrderRows([{ flavour: '', qty: 1, price: 0 }]);
      } else {
        const err = await response.json();
        alert(`Error: ${JSON.stringify(err)}`);
      }
    } catch {
      alert('Cannot reach server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const business = profile?.business_details;

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
          <p className="order-sub">Pick your flavours — your business details are pre-filled</p>
        </div>

        <div className="order-layout">
          {/* Pre-filled business info — read only */}
          <div className="order-card">
            <h3 className="card-title">📋 Delivering To</h3>
            {business ? (
              <div className="prefill-grid">
                <div className="prefill-item">
                  <span className="prefill-label">Business</span>
                  <span className="prefill-value">{business.name}</span>
                </div>
                <div className="prefill-item">
                  <span className="prefill-label">Contact</span>
                  <span className="prefill-value">{business.contact_person || '—'}</span>
                </div>
                <div className="prefill-item">
                  <span className="prefill-label">Phone</span>
                  <span className="prefill-value">{business.phone || '—'}</span>
                </div>
                <div className="prefill-item">
                  <span className="prefill-label">Address</span>
                  <span className="prefill-value">{business.address || '—'}</span>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading profile...</p>
            )}
            <p className="prefill-hint">
              ✏️ Need to update these details?{' '}
              <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                Visit your Dashboard → Edit Profile
              </span>
            </p>
          </div>

          {/* Flavour selection */}
          <div className="order-card">
            <h3 className="card-title">🍦 Your Flavours</h3>
            {errors.flavours && <p className="error-msg">{errors.flavours}</p>}
            <div className="order-rows">
              {orderRows.map((row, i) => (
                <OrderRow key={i} row={row} index={i}
                  onUpdate={updateRow} onRemove={removeRow}
                  showRemove={orderRows.length > 1} />
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
        customerInfo={{
          contact_person: business?.contact_person || '—',
          business_name:  business?.name || '—',
          phone:          business?.phone || '—',
          address:        business?.address || '—',
        }}
        total={total}
        onConfirm={handlePlaceOrder}
        loading={loading}
      />
    </div>
  );
};

export default Order;