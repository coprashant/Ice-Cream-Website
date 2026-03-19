import React, { useState, useEffect, useRef } from 'react';
import { flavourData, getPriceByName } from '../../data/flavours';
import api from '../../api';
import './Order.css';

const IconX       = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconLock    = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconCheck   = () => <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/></svg>;
const IconReceipt = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const IconGrid    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconPlus    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconWarn    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconEdit    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;

// Single flavour row in the order form
const OrderRow = ({ row, index, onUpdate, onRemove, showRemove, hasError }) => {
  const handleFlavourChange = (e) => {
    const name  = e.target.value;
    const price = getPriceByName(name);
    onUpdate(index, { ...row, flavour: name, price });
  };

  const handleQtyChange = (e) =>
    onUpdate(index, { ...row, qty: Math.max(1, parseInt(e.target.value) || 1) });

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
          <option value="" disabled>Select a flavour…</option>
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
        <button type="button" className="remove-btn" onClick={() => onRemove(index)} aria-label="Remove row">
          <IconX />
        </button>
      )}
    </div>
  );
};

// Order summary modal shown before final confirmation
const PreviewModal = ({ isOpen, onClose, orderRows, customerInfo, total, onConfirm, loading, submitError }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose} aria-label="Close"><IconX /></button>

        <div className="modal-header">
          <div className="modal-icon-wrap"><IconReceipt /></div>
          <h2>Order Summary</h2>
          <p>Please review before confirming</p>
        </div>

        <div className="modal-customer">
          {[
            { label: 'Contact',  value: customerInfo.contact_person },
            { label: 'Business', value: customerInfo.business_name  },
            { label: 'Phone',    value: customerInfo.phone           },
            { label: 'Address',  value: customerInfo.address         },
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

        {submitError && (
          <div className="modal-error">
            <IconWarn /> {submitError}
          </div>
        )}

        <button className="btn-confirm" onClick={onConfirm} disabled={loading}>
          {loading ? 'Placing Order…' : 'Confirm & Place Order'}
        </button>
      </div>
    </div>
  );
};

// Shown after a successful order — auto-redirects to dashboard
const ConfirmationScreen = ({ order, onPlaceAnother, onGoToDashboard }) => {
  const [countdown, setCountdown] = useState(8);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      if (isMounted.current) onGoToDashboard();
      return;
    }
    const t = setTimeout(() => {
      if (isMounted.current) setCountdown(c => c - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  return (
    <div className="order-page">
      <div className="confirmation-screen">
        <div className="confirmation-icon-wrap"><IconCheck /></div>
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
            <IconPlus /> Place Another Order
          </button>
          <button className="btn-primary-order" onClick={onGoToDashboard}>
            <IconGrid /> Go to Dashboard
            <span className="countdown-badge">{countdown}</span>
          </button>
        </div>

        <p className="confirmation-hint">Redirecting to dashboard in {countdown}s…</p>
      </div>
    </div>
  );
};

// Main order page
const Order = ({ currentUser, setActivePage }) => {
  const [profile,         setProfile]         = useState(null);
  const [profileLoading,  setProfileLoading]  = useState(true);
  const [profileError,    setProfileError]    = useState('');
  const [orderRows,       setOrderRows]       = useState([{ flavour: '', qty: 1, price: 0 }]);
  const [showModal,       setShowModal]       = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [submitError,     setSubmitError]     = useState('');
  const [confirmedOrder,  setConfirmedOrder]  = useState(null);
  const [errors,          setErrors]          = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    setProfileLoading(true);
    setProfileError('');
    api.get('/auth/me')
      .then(data  => setProfile(data))
      .catch(err  => setProfileError(err.message || 'Could not load profile.'))
      .finally(() => setProfileLoading(false));
  }, [currentUser]);

  // Live validation after first submission attempt
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

  if (!currentUser) {
    return (
      <div className="order-page">
        <div className="gate-screen">
          <div className="gate-icon"><IconLock /></div>
          <h2>Sign in to order</h2>
          <p>Use the Login button in the top bar to access ordering.</p>
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
          setSubmitError('');
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
    if (validate()) {
      setSubmitError('');
      setShowModal(true);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setSubmitError('');
    try {
      const result = await api.post('/orders/place', {
        business: currentUser.business,
        items: orderRows
          .filter(r => r.flavour)
          .map(r => ({ item_name: r.flavour, quantity: r.qty, price: r.price })),
      });
      setShowModal(false);
      setConfirmedOrder(result);
    } catch (err) {
      setSubmitError(err.message || 'Could not place order. Please try again.');
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
          <p className="order-sub">Select your flavours and quantities below</p>
        </div>

        {profileError && (
          <div className="profile-load-error">
            <IconWarn /> Could not load your profile. Your details may not appear in the summary.
          </div>
        )}

        <div className="order-card">
          <div className="card-title-row">
            <h3 className="card-title">Flavour Selection</h3>
            {business && !profileLoading && (
              <span className="delivery-hint">
                <IconEdit /> Delivering to {business.name}
              </span>
            )}
          </div>

          {errors.flavours && (
            <div className="validation-error-banner">
              <IconWarn /> {errors.flavours}
            </div>
          )}

          {profileLoading ? (
            <div className="profile-loading">
              {[1,2].map(i => (
                <div key={i} className="profile-skeleton-row">
                  <div className="skeleton sk-label" />
                  <div className="skeleton sk-value" />
                </div>
              ))}
            </div>
          ) : (
            <>
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
                <IconPlus /> Add Another Flavour
              </button>
            </>
          )}
        </div>

        <div className="order-bottom-bar">
          <div className="order-total">
            <span className="total-label">Total</span>
            <span className="total-value">रु{total.toFixed(2)}</span>
          </div>
          <button className="btn-review" onClick={handleReview}>
            Review &amp; Place Order
          </button>
        </div>

      </div>

      <PreviewModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        orderRows={orderRows}
        customerInfo={{
          contact_person: business?.contact_person || '—',
          business_name:  business?.name           || '—',
          phone:          business?.phone          || '—',
          address:        business?.address        || '—',
        }}
        total={total}
        onConfirm={handlePlaceOrder}
        loading={loading}
        submitError={submitError}
      />
    </div>
  );
};

export default Order;