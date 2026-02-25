import React, { useState, useEffect } from 'react';
import { flavourData, getPriceByName } from '../../data/flavours';
import './Order.css';

const OrderRow = ({ row, index, onUpdate, onRemove, showRemove }) => {
  const handleFlavourChange = (e) => {
    const name = e.target.value;
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
        <select
          value={row.flavour}
          onChange={handleFlavourChange}
          className="select-field"
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
          <button
            type="button"
            className="qty-btn"
            onClick={() => onUpdate(index, { ...row, qty: Math.max(1, row.qty - 1) })}
          >−</button>
          <input
            type="number"
            value={row.qty}
            onChange={handleQtyChange}
            min="1"
            className="qty-input"
            required
          />
          <button
            type="button"
            className="qty-btn"
            onClick={() => onUpdate(index, { ...row, qty: row.qty + 1 })}
          >+</button>
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
            <span>Item</span>
            <span>Qty × Price</span>
            <span>Total</span>
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

        <button
          className="btn-confirm"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? '⏳ Placing Order...' : '✅ Confirm & Place Order'}
        </button>
      </div>
    </div>
  );
};

const Order = () => {
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [orderRows, setOrderRows] = useState([{ flavour: '', qty: 1, price: 0 }]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errors, setErrors] = useState({});

  const total = orderRows.reduce((sum, row) => sum + (row.price * row.qty), 0);

  const updateRow = (index, updated) => {
    setOrderRows(prev => prev.map((r, i) => i === index ? updated : r));
  };

  const removeRow = (index) => {
    setOrderRows(prev => prev.filter((_, i) => i !== index));
  };

  const addRow = () => {
    setOrderRows(prev => [...prev, { flavour: '', qty: 1, price: 0 }]);
  };

  const validate = () => {
    const e = {};
    if (!customerInfo.name.trim()) e.name = 'Name is required';
    if (!/^9[78][0-9]{8}$/.test(customerInfo.phone)) e.phone = 'Enter valid Nepali number (98XXXXXXXX)';
    if (!customerInfo.address.trim()) e.address = 'Address is required';
    if (!orderRows.some(r => r.flavour)) e.flavours = 'Select at least one flavour';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleReview = () => {
    if (validate()) setShowModal(true);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    const items = orderRows.filter(r => r.flavour).map(r => ({
      itemName: r.flavour,
      quantity: r.qty,
      price: r.price
    }));

    const orderData = {
      businessId: localStorage.getItem('businessId'),
      totalAmount: total,
      status: 'Pending',
      items,
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      customerAddress: customerInfo.address,
    };

    try {
      const response = await fetch('http://localhost:8080/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        setShowModal(false);
        setSuccessMsg(`🎉 Order placed! Order ID: ${result.id}`);
        setCustomerInfo({ name: '', phone: '', address: '' });
        setOrderRows([{ flavour: '', qty: 1, price: 0 }]);
      } else {
        alert('Server error. Please try again.');
      }
    } catch {
      alert('Cannot reach server. Is the backend running?');
    } finally {
      setLoading(false);
    }
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
        </div>

        <div className="order-layout">
          {/* Customer Info */}
          <div className="order-card">
            <h3 className="card-title">📋 Your Details</h3>
            <div className="fields-grid">
              <div className="field-group">
                <label className="field-label">Full Name *</label>
                <input
                  type="text"
                  className={`input-field${errors.name ? ' error' : ''}`}
                  placeholder="e.g. Ramesh Sharma"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(p => ({ ...p, name: e.target.value }))}
                />
                {errors.name && <span className="error-msg">{errors.name}</span>}
              </div>

              <div className="field-group">
                <label className="field-label">Phone Number *</label>
                <input
                  type="tel"
                  className={`input-field${errors.phone ? ' error' : ''}`}
                  placeholder="98XXXXXXXX"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(p => ({ ...p, phone: e.target.value }))}
                />
                {errors.phone && <span className="error-msg">{errors.phone}</span>}
              </div>

              <div className="field-group full-width">
                <label className="field-label">Delivery Address *</label>
                <input
                  type="text"
                  className={`input-field${errors.address ? ' error' : ''}`}
                  placeholder="Street, Ward, City"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo(p => ({ ...p, address: e.target.value }))}
                />
                {errors.address && <span className="error-msg">{errors.address}</span>}
              </div>
            </div>
          </div>

          {/* Flavour Selection */}
          <div className="order-card">
            <h3 className="card-title">🍦 Your Flavours</h3>
            {errors.flavours && <p className="error-msg">{errors.flavours}</p>}

            <div className="order-rows">
              {orderRows.map((row, i) => (
                <OrderRow
                  key={i}
                  row={row}
                  index={i}
                  onUpdate={updateRow}
                  onRemove={removeRow}
                  showRemove={orderRows.length > 1}
                />
              ))}
            </div>

            <button type="button" className="add-flavour-btn" onClick={addRow}>
              + Add Another Flavour
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
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
