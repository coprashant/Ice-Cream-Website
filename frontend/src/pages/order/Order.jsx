import React, { useState, useEffect, useRef } from 'react';
import { flavourData, getPriceByName } from '../../data/flavours';
import './Order.css';

const API_BASE = 'http://localhost:8000/api';

// Single flavour row
const OrderRow = ({ row, index, onUpdate, onRemove, showRemove, hasError }) => {
  const handleFlavourChange = (e) => {
    const name  = e.target.value;
    const price = getPriceByName(name);
    onUpdate(index, { ...row, flavour: name, price });
  };

  const handleQtyChange = (e) => {
    onUpdate(index, { ...row, qty: Math.max(1, parseInt(e.target.value) || 1) });
  };

  return (
    <div className={`order-row${hasError ? ' row-error' : ''}`}>
      <div className="order-row-select">
        <label className="field-label">Flavour</label>
        <select
          value={row.flavour}
          onChange={handleFlavourChange}
          className={`select-field${hasError ? ' field-invalid' : ''}`}
          required
        >
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


// Preview modal
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
          {[
            { label: 'Contact',  value: customerInfo.contact_person },
            { label: 'Business', value: customerInfo.business_name },
            { label: 'Phone',    value: customerInfo.phone },
            { label: 'Address',  value: customerInfo.address },
          ].map(({ label, value }) => (
            <div key={label} className="modal-info-row">
              <span className="modal-info-label">{label}</span>
              <span className="modal-info-value">{value}</span>
            </div>
          ))}
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

// Order Confirmation Screen
const ConfirmationScreen = ({ order, onPlaceAnother, onGoToDashboard }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) { onGoToDashboard(); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  return (
    <div className="order-page">
      <div className="confirmation-screen">
        <div className="confirmation-icon">🎉</div>
        <h2 className="confirmation-title">Order Placed!</h2>
        <p className="confirmation-sub">Your order has been received and is being processed.</p>

        <div className="confirmation-card">
          <div className="confirmation-id">
            <span className="conf-label">Order ID</span>
            <span className="conf-value">#{order.id}</span>
          </div>
          <div className="confirmation-divider" />
          <div className="confirmation-items">
            {order.items.map((item, i) => (
              <div key={i} className="conf-item-row">
                <span className="conf-item-name">{item.item_name}</span>
                <span className="conf-item-qty">× {item.quantity}</span>
                <span className="conf-item-price">रु{parseFloat(item.subtotal).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="confirmation-divider" />
          <div className="confirmation-total">
            <span>Total</span>
            <span className="conf-total-value">रु{parseFloat(order.total_amount).toFixed(2)}</span>
          </div>
        </div>

        <div className="confirmation-actions">
          <button className="btn-secondary-order" onClick={onPlaceAnother}>
            + Place Another Order
          </button>
          <button className="btn-primary-order" onClick={onGoToDashboard}>
            Go to Dashboard
            <span className="countdown-badge">{countdown}</span>
          </button>
        </div>

        <p className="confirmation-hint">Redirecting to dashboard in {countdown}s…</p>
      </div>
    </div>
  );
};

// Main Order page
const Order = ({ currentUser, setActivePage }) => {
  const [profile,         setProfile]         = useState(null);
  const [profileLoading,  setProfileLoading]  = useState(true);
  const [orderRows,       setOrderRows]       = useState([{ flavour: '', qty: 1, price: 0 }]);
  const [showModal,       setShowModal]       = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [confirmedOrder,  setConfirmedOrder]  = useState(null);
  const [errors,          setErrors]          = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    setProfileLoading(true);
    fetch(`${API_BASE}/auth/me`, { headers: { 'X-User-Id': currentUser.id } })
      .then(r => r.json())
      .then(data => setProfile(data))
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, [currentUser]);

  // Re-validate live once user has tried submitting
  useEffect(() => {
    if (!submitAttempted) return;
    const e = {};
    if (!orderRows.some(r => r.flavour)) e.flavours = 'Please select at least one flavour.';
    const emptyRowIndices = orderRows.length > 1
      ? orderRows.map((r, i) => (!r.flavour ? i : null)).filter(i => i !== null)
      : [];
    if (emptyRowIndices.length) e.emptyRows = emptyRowIndices;
    setErrors(e);
  }, [orderRows, submitAttempted]);

  // ── Conditional renders AFTER all hooks ──

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

  if (confirmedOrder) {
    return (
      <ConfirmationScreen
        order={confirmedOrder}
        onPlaceAnother={() => {
          setConfirmedOrder(null);
          setOrderRows([{ flavour: '', qty: 1, price: 0 }]);
          setErrors({});
          setSubmitAttempted(false);
        }}
        onGoToDashboard={() => setActivePage?.('dashboard')}
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
    if (!orderRows.some(r => r.flavour)) e.flavours = 'Please select at least one flavour.';
    const emptyRowIndices = orderRows.length > 1
      ? orderRows.map((r, i) => (!r.flavour ? i : null)).filter(i => i !== null)
      : [];
    if (emptyRowIndices.length) e.emptyRows = emptyRowIndices;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleReview = () => {
    setSubmitAttempted(true);
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
        setConfirmedOrder(result);
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
  const total    = orderRows.reduce((sum, r) => sum + r.price * r.qty, 0);

  return (
    <div className="order-page">
      <div className="order-container">
        <div className="order-header">
          <span className="section-eyebrow">Place Order</span>
          <h1 className="order-title">What would you like?</h1>
          <p className="order-sub">Pick your flavours — your business details are pre-filled</p>
        </div>

        <div className="order-layout">
          {/* Pre-filled business info */}
          <div className="order-card">
            <h3 className="card-title">📋 Delivering To</h3>
            {profileLoading ? (
              <div className="profile-loading">
                {[1,2,3,4].map(i => (
                  <div key={i} className="profile-skeleton-row">
                    <div className="skeleton sk-label" />
                    <div className="skeleton sk-value" />
                  </div>
                ))}
              </div>
            ) : business ? (
              <div className="prefill-grid">
                {[
                  { label: 'Business', value: business.name },
                  { label: 'Contact',  value: business.contact_person || '—' },
                  { label: 'Phone',    value: business.phone || '—' },
                  { label: 'Address',  value: business.address || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="prefill-item">
                    <span className="prefill-label">{label}</span>
                    <span className="prefill-value">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="profile-error">Could not load profile. Please refresh.</p>
            )}
            <p className="prefill-hint">
              ✏️ Need to update these?{' '}
              <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                Use the 👤 menu → Edit Profile
              </span>
            </p>
          </div>

          {/* Flavour selection */}
          <div className="order-card">
            <h3 className="card-title">🍦 Your Flavours</h3>

            {errors.flavours && (
              <div className="validation-error-banner">
                ⚠️ {errors.flavours}
              </div>
            )}

            <div className="order-rows">
              {orderRows.map((row, i) => (
                <OrderRow
                  key={i}
                  row={row}
                  index={i}
                  onUpdate={updateRow}
                  onRemove={removeRow}
                  showRemove={orderRows.length > 1}
                  hasError={errors.emptyRows?.includes(i)}
                />
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