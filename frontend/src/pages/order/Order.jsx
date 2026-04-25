import React, { useState, useEffect, useRef, useCallback } from 'react';
import { flavourData, getPriceByName } from '../../data/flavours';
import api from '../../api';
import './Order.css';

/* ── Icons ──────────────────────────────────────────── */
const IconX       = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconLock    = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconCheck   = () => <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/></svg>;
const IconReceipt = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const IconGrid    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconPlus    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconWarn    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconEdit    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconPdf     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>;
const IconUpload  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>;
const IconQr      = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconTrash   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>;

/* ── Logo fetcher ───────────────────────────────────────
   Fetches /logo.png once and caches it as a base64 data URL
   so the iframe PDF document can embed it inline without
   making a cross-origin request from inside the iframe. */
let _logoDataUrl = null;

const getLogoDataUrl = async () => {
  if (_logoDataUrl) return _logoDataUrl;
  try {
    const res  = await fetch('/logo.png');
    const blob = await res.blob();
    return new Promise(resolve => {
      const reader     = new FileReader();
      reader.onloadend = () => { _logoDataUrl = reader.result; resolve(_logoDataUrl); };
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

/* ── PDF generator ──────────────────────────────────────
   Builds a styled HTML receipt and prints it via a hidden
   iframe. No external library required.
   isPreview: when true the invoice number is shown as a dash
   instead of the word "Preview". */
const generatePDF = async ({ order, business, paymentDone, isPreview }) => {
  const logoDataUrl = await getLogoDataUrl();

  const date = new Date(order.order_date || Date.now()).toLocaleDateString('en-NP', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const logoHtml = logoDataUrl
    ? `<img src="${logoDataUrl}" alt="logo" class="brand-logo" />`
    : '';

  const invoiceNum = isPreview ? '-' : `#${order.id}`;

  const itemRows = order.items.map(item => `
    <tr>
      <td>${item.item_name}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:right">Rs. ${parseFloat(item.price).toFixed(2)}</td>
      <td style="text-align:right">Rs. ${parseFloat(item.subtotal).toFixed(2)}</td>
    </tr>
  `).join('');

  const paymentSection = paymentDone
    ? `<div class="pay-status paid">Payment Confirmed by Customer</div>`
    : `<div class="pay-status unpaid">Payment Pending</div>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Invoice ${invoiceNum} - Sheetal Ice Cream</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #0d2333; padding: 40px; font-size: 13px; }
  .invoice-wrap { max-width: 680px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .brand-logo { width: 46px; height: 46px; border-radius: 10px; object-fit: contain; }
  .brand-text h1 { font-size: 22px; font-weight: 800; color: #2E7EAA; letter-spacing: -0.02em; }
  .brand-text p { font-size: 11px; color: #8ba0b2; margin-top: 3px; }
  .invoice-meta { text-align: right; }
  .inv-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #8ba0b2; }
  .inv-num { font-size: 18px; font-weight: 800; color: #0d2333; }
  .inv-date { font-size: 11px; color: #4a6175; margin-top: 4px; }
  .divider { border: none; border-top: 1.5px solid #daeaf6; margin: 0 0 24px; }
  .bill-to h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #8ba0b2; margin-bottom: 6px; }
  .bill-to p { font-size: 13px; color: #0d2333; line-height: 1.6; }
  .bill-to p strong { font-weight: 700; }
  table { width: 100%; border-collapse: collapse; margin: 24px 0; }
  thead { background: #2E7EAA; }
  thead th { color: white; text-align: left; padding: 10px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
  thead th:not(:first-child) { text-align: right; }
  tbody tr { border-bottom: 1px solid #daeaf6; }
  tbody td { padding: 10px 12px; font-size: 13px; }
  tfoot td { padding: 12px; font-weight: 700; }
  .total-row td { border-top: 2px solid #2E7EAA; font-size: 15px; font-weight: 800; color: #2E7EAA; }
  .pay-status { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 100px; font-size: 11px; font-weight: 700; margin: 0 0 20px; }
  .paid { background: rgba(34,197,94,0.12); color: #15803d; border: 1px solid rgba(34,197,94,0.3); }
  .unpaid { background: rgba(245,158,11,0.12); color: #b45309; border: 1px solid rgba(245,158,11,0.3); }
  .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #8ba0b2; }
  .footer strong { color: #2E7EAA; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="invoice-wrap">
  <div class="header">
    <div class="brand">
      ${logoHtml}
      <div class="brand-text">
        <h1>Sheetal Ice Cream</h1>
        <p>Thapathali, Kathmandu, Nepal</p>
        <p>sheetal.icecream@gmail.com</p>
      </div>
    </div>
    <div class="invoice-meta">
      <div class="inv-label">Invoice</div>
      <div class="inv-num">${invoiceNum}</div>
      <div class="inv-date">${date}</div>
    </div>
  </div>
  <hr class="divider"/>
  <div class="bill-to">
    <h3>Bill To</h3>
    <p><strong>${business?.name || 'N/A'}</strong></p>
    <p>${business?.contact_person || ''}</p>
    <p>${business?.phone || ''}</p>
    <p>${business?.address || ''}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th style="text-align:right">Qty</th>
        <th style="text-align:right">Unit Price</th>
        <th style="text-align:right">Subtotal</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="3">Total Amount</td>
        <td style="text-align:right">Rs. ${parseFloat(order.total_amount).toFixed(2)}</td>
      </tr>
    </tfoot>
  </table>
  ${paymentSection}
  <div class="footer">
    <p>Thank you for your order! <strong>Sheetal Ice Cream</strong> loves serving you.</p>
    <p style="margin-top:6px">This is a computer generated invoice.</p>
  </div>
</div>
</body>
</html>`;

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:800px;height:1000px;border:none';
  document.body.appendChild(iframe);
  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();
  setTimeout(() => {
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 2000);
  }, 400);
};

/* ── Order Row ──────────────────────────────────────── */
const OrderRow = ({ row, index, onUpdate, onRemove, showRemove, hasError }) => {
  const handleFlavourChange = (e) => {
    const name  = e.target.value;
    const price = getPriceByName(name);
    onUpdate(index, { ...row, flavour: name, price });
  };

  return (
    <div className={`order-row${hasError ? ' row-error' : ''}`}>
      <div className="order-row-select">
        <label className="field-label">Flavour</label>
        <select value={row.flavour} onChange={handleFlavourChange}
          className={`select-field${hasError ? ' field-invalid' : ''}`} required>
          <option value="" disabled>Select a flavour</option>
          {Object.entries(flavourData).map(([category, items]) => (
            <optgroup key={category} label={category}>
              {items.map(item => (
                <option key={item.name} value={item.name}>
                  {item.emoji} {item.name} Rs.{item.price}
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
            onClick={() => onUpdate(index, { ...row, qty: Math.max(1, row.qty - 1) })}>-</button>
          <input type="number" value={row.qty} min="1" className="qty-input" required
            onChange={e => onUpdate(index, { ...row, qty: Math.max(1, parseInt(e.target.value) || 1) })} />
          <button type="button" className="qty-btn"
            onClick={() => onUpdate(index, { ...row, qty: row.qty + 1 })}>+</button>
        </div>
      </div>

      <div className="order-row-subtotal">
        <label className="field-label">Subtotal</label>
        <span className="subtotal-value">{row.flavour ? `Rs.${row.price * row.qty}` : '-'}</span>
      </div>

      {showRemove && (
        <button type="button" className="remove-btn" onClick={() => onRemove(index)} aria-label="Remove row">
          <IconX />
        </button>
      )}
    </div>
  );
};

/* ── QR image with React state fallback ─────────────────
   FIX: the previous approach used onError to toggle display
   on DOM siblings inside a flex container, which meant the
   SVG fallback was always in the layout even when hidden.
   Now a boolean state swap renders only one or the other. */
const QrImage = () => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="qr-fallback">
        <svg width="72" height="72" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100" rx="8" fill="var(--hover-bg)"/>
          <rect x="10" y="10" width="32" height="32" rx="4" fill="none" stroke="var(--text-muted)" strokeWidth="4"/>
          <rect x="18" y="18" width="16" height="16" rx="2" fill="var(--text-muted)"/>
          <rect x="58" y="10" width="32" height="32" rx="4" fill="none" stroke="var(--text-muted)" strokeWidth="4"/>
          <rect x="66" y="18" width="16" height="16" rx="2" fill="var(--text-muted)"/>
          <rect x="10" y="58" width="32" height="32" rx="4" fill="none" stroke="var(--text-muted)" strokeWidth="4"/>
          <rect x="18" y="66" width="16" height="16" rx="2" fill="var(--text-muted)"/>
          <rect x="58" y="58" width="8" height="8" rx="1" fill="var(--text-muted)"/>
          <rect x="70" y="58" width="8" height="8" rx="1" fill="var(--text-muted)"/>
          <rect x="82" y="58" width="8" height="8" rx="1" fill="var(--text-muted)"/>
          <rect x="58" y="70" width="8" height="8" rx="1" fill="var(--text-muted)"/>
          <rect x="82" y="70" width="8" height="8" rx="1" fill="var(--text-muted)"/>
          <rect x="58" y="82" width="8" height="8" rx="1" fill="var(--text-muted)"/>
          <rect x="70" y="82" width="8" height="8" rx="1" fill="var(--text-muted)"/>
          <rect x="82" y="82" width="8" height="8" rx="1" fill="var(--text-muted)"/>
        </svg>
        <p className="qr-fallback-text">QR Code</p>
      </div>
    );
  }

  return (
    <img
      src="/qr.png"
      alt="Scan to pay"
      className="qr-image"
      onError={() => setFailed(true)}
    />
  );
};

/* ── Payment Section ────────────────────────────────── */
const PaymentSection = ({
  paymentDone, onPaymentDoneChange,
  screenshotFile, onScreenshotChange,
  screenshotPreview, onClearScreenshot,
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    onScreenshotChange(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) onScreenshotChange(file);
  }, [onScreenshotChange]);

  return (
    <div className="payment-section">
      <div className="payment-section-header">
        <IconQr />
        <h3 className="payment-section-title">Payment</h3>
      </div>

      <div className="qr-container">
        <div className="qr-placeholder" aria-label="Bank QR code">
          <QrImage />
        </div>
        <div className="qr-info">
          <p className="qr-bank-name">Sheetal Ice Cream</p>
          <p className="qr-bank-detail">Account: <strong>XXXX-XXXX-XXXX</strong></p>
          <p className="qr-bank-detail">Bank: <strong>Your Bank Name</strong></p>
          <p className="qr-instruction">
            Scan the QR or transfer to the account above, then upload the screenshot below.
          </p>
        </div>
      </div>

      <label className="payment-checkbox-row">
        <input type="checkbox" className="payment-checkbox" checked={paymentDone}
          onChange={e => onPaymentDoneChange(e.target.checked)} />
        <span className="payment-checkbox-label">I have completed the payment</span>
      </label>

      <div
        className={`screenshot-drop-zone${screenshotPreview ? ' has-preview' : ''}`}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => !screenshotPreview && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && !screenshotPreview && fileInputRef.current?.click()}
        aria-label="Upload payment screenshot"
      >
        <input type="file" ref={fileInputRef} accept="image/*"
          onChange={handleFileChange} style={{ display: 'none' }} />
        {screenshotPreview ? (
          <div className="screenshot-preview-wrap">
            <img src={screenshotPreview} alt="Payment screenshot" className="screenshot-preview-img" />
            <button type="button" className="screenshot-clear-btn"
              onClick={e => { e.stopPropagation(); onClearScreenshot(); }}
              aria-label="Remove screenshot">
              <IconTrash /> Remove
            </button>
          </div>
        ) : (
          <div className="screenshot-drop-content">
            <div className="screenshot-drop-icon"><IconUpload /></div>
            <p className="screenshot-drop-text">
              Drop payment screenshot here or <span className="screenshot-drop-link">browse</span>
            </p>
            <p className="screenshot-drop-hint">PNG, JPG, JPEG up to 5MB</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Preview Modal ──────────────────────────────────────
   FIX: modal was clipping on tall content because the overlay
   used align-items:center with no overflow. The overlay now
   handles its own scroll (overflow-y:auto, padding for breathing
   room) and the modal-box uses margin:auto to stay centred
   naturally when content is short. See Order.css for the rules. */
const PreviewModal = ({
  isOpen, onClose, orderRows, customerInfo, total,
  onConfirm, loading, submitError,
  paymentDone, screenshotFile, screenshotPreview,
  onDownloadPdf,
}) => {
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
            <span>Item</span><span>Qty x Price</span><span>Total</span>
          </div>
          {orderRows.filter(r => r.flavour).map((row, i) => (
            <div key={i} className="modal-item-row">
              <span>{row.flavour}</span>
              <span>{row.qty} x Rs.{row.price}</span>
              <span>Rs.{row.qty * row.price}</span>
            </div>
          ))}
        </div>

        <div className="modal-total">
          <span>Total Amount</span>
          <span className="modal-total-value">Rs.{total.toFixed(2)}</span>
        </div>

        <div className={`modal-payment-badge${paymentDone ? ' paid' : ' unpaid'}`}>
          {paymentDone ? 'Payment Completed' : 'Payment Pending'}
          {screenshotFile && <span className="modal-payment-attach">receipt attached</span>}
        </div>

        {screenshotPreview && (
          <div className="modal-screenshot-preview">
            <p className="modal-screenshot-label">Payment Receipt</p>
            <img src={screenshotPreview} alt="Payment screenshot" className="modal-screenshot-img" />
          </div>
        )}

        {submitError && (
          <div className="modal-error"><IconWarn /> {submitError}</div>
        )}

        <button type="button" className="btn-download-pdf" onClick={onDownloadPdf}>
          <IconPdf /> Download Invoice PDF
        </button>

        <button className="btn-confirm" onClick={onConfirm} disabled={loading}>
          {loading ? 'Placing Order' : 'Confirm and Place Order'}
        </button>
      </div>
    </div>
  );
};

/* ── Confirmation Screen ─────────────────────────────── */
const ConfirmationScreen = ({ order, business, paymentDone, onPlaceAnother, onGoToDashboard }) => {
  const [countdown, setCountdown] = useState(8);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (countdown <= 0) { if (isMounted.current) onGoToDashboard(); return; }
    const t = setTimeout(() => { if (isMounted.current) setCountdown(c => c - 1); }, 1000);
    return () => clearTimeout(t);
  }, [countdown, onGoToDashboard]);

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
                <span className="conf-item-qty">x {item.quantity}</span>
                <span className="conf-item-price">Rs.{parseFloat(item.subtotal).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="confirmation-divider" />
          <div className="confirmation-total">
            <span>Total</span>
            <span className="conf-total-value">Rs.{parseFloat(order.total_amount).toFixed(2)}</span>
          </div>
          <div className="confirmation-divider" />
          <div className={`conf-payment-row ${paymentDone ? 'paid' : 'unpaid'}`}>
            <span className="conf-payment-label">
              {paymentDone ? 'Payment: Completed' : 'Payment: Pending'}
            </span>
          </div>
        </div>

        <div className="confirmation-actions">
          <button className="btn-secondary-order" onClick={onPlaceAnother}>
            <IconPlus /> Place Another Order
          </button>
          <button className="btn-download-pdf-confirm"
            onClick={() => generatePDF({ order, business, paymentDone, isPreview: false })}>
            <IconPdf /> Download Invoice
          </button>
          <button className="btn-primary-order" onClick={onGoToDashboard}>
            <IconGrid /> Go to Dashboard
            <span className="countdown-badge">{countdown}</span>
          </button>
        </div>

        <p className="confirmation-hint">Redirecting to dashboard in {countdown}s</p>
      </div>
    </div>
  );
};

/* ── Main Order Page ────────────────────────────────── */
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
  const [paymentDone,       setPaymentDone]       = useState(false);
  const [screenshotFile,    setScreenshotFile]    = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    setProfileLoading(true);
    setProfileError('');
    api.get('/auth/me')
      .then(data  => setProfile(data))
      .catch(err  => setProfileError(err.message || 'Could not load profile.'))
      .finally(() => setProfileLoading(false));
  }, [currentUser]);

  useEffect(() => {
    if (!submitAttempted) return;
    const e = {};
    if (!orderRows.some(r => r.flavour)) e.flavours = 'Please select at least one flavour.';
    const emptyRows = orderRows.length > 1
      ? orderRows.map((r, i) => (!r.flavour ? i : null)).filter(i => i !== null)
      : [];
    if (emptyRows.length) e.emptyRows = emptyRows;
    setErrors(e);
  }, [orderRows, submitAttempted]);

  const handleScreenshotChange = useCallback((file) => {
    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setScreenshotPreview(reader.result);
    reader.readAsDataURL(file);
  }, []);

  const handleClearScreenshot = useCallback(() => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
  }, []);

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

  const business = profile?.business_details;
  const total    = orderRows.reduce((sum, r) => sum + r.price * r.qty, 0);

  if (confirmedOrder) {
    return (
      <ConfirmationScreen
        order={confirmedOrder}
        business={business}
        paymentDone={paymentDone}
        onPlaceAnother={() => {
          setConfirmedOrder(null);
          setOrderRows([{ flavour: '', qty: 1, price: 0 }]);
          setErrors({});
          setSubmitAttempted(false);
          setSubmitError('');
          setPaymentDone(false);
          setScreenshotFile(null);
          setScreenshotPreview(null);
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
    const emptyRows = orderRows.length > 1
      ? orderRows.map((r, i) => (!r.flavour ? i : null)).filter(i => i !== null)
      : [];
    if (emptyRows.length) e.emptyRows = emptyRows;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleReview = () => {
    setSubmitAttempted(true);
    if (validate()) { setSubmitError(''); setShowModal(true); }
  };

  const handleDownloadPdf = () => {
    const previewOrder = {
      id:           null,
      order_date:   new Date().toISOString(),
      total_amount: total.toFixed(2),
      items: orderRows.filter(r => r.flavour).map(r => ({
        item_name: r.flavour, quantity: r.qty, price: r.price, subtotal: r.price * r.qty,
      })),
    };
    generatePDF({ order: previewOrder, business, paymentDone, isPreview: true });
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setSubmitError('');
    try {
      const validItems = orderRows.filter(r => r.flavour).map(r => ({
        item_name: r.flavour, quantity: r.qty, price: r.price,
      }));

      let result;
      if (screenshotFile) {
        const formData = new FormData();
        formData.append('business',           currentUser.business);
        formData.append('items',              JSON.stringify(validItems));
        formData.append('payment_done',       paymentDone ? 'true' : 'false');
        formData.append('payment_screenshot', screenshotFile);

        const token = (await import('../../api')).tokenStorage.getAccess();
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/orders/place`,
          { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: formData }
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || err.detail || `HTTP ${res.status}`);
        }
        result = await res.json();
      } else {
        result = await api.post('/orders/place', {
          business: currentUser.business, items: validItems, payment_done: paymentDone,
        });
      }

      setShowModal(false);
      setConfirmedOrder(result);
    } catch (err) {
      setSubmitError(err.message || 'Could not place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              <span className="delivery-hint"><IconEdit /> Delivering to {business.name}</span>
            )}
          </div>
          {errors.flavours && (
            <div className="validation-error-banner"><IconWarn /> {errors.flavours}</div>
          )}
          {profileLoading ? (
            <div className="profile-loading">
              {[1, 2].map(i => (
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
                  <OrderRow key={i} row={row} index={i}
                    onUpdate={updateRow} onRemove={removeRow}
                    showRemove={orderRows.length > 1}
                    hasError={errors.emptyRows?.includes(i)} />
                ))}
              </div>
              <button type="button" className="add-flavour-btn" onClick={addRow}>
                <IconPlus /> Add Another Flavour
              </button>
            </>
          )}
        </div>

        <div className="order-card">
          <PaymentSection
            paymentDone={paymentDone}
            onPaymentDoneChange={setPaymentDone}
            screenshotFile={screenshotFile}
            onScreenshotChange={handleScreenshotChange}
            screenshotPreview={screenshotPreview}
            onClearScreenshot={handleClearScreenshot}
          />
        </div>

        <div className="order-bottom-bar">
          <div className="order-total">
            <span className="total-label">Total</span>
            <span className="total-value">Rs.{total.toFixed(2)}</span>
          </div>
          <div className="order-bottom-actions">
            <button className="btn-pdf-preview" onClick={handleDownloadPdf} disabled={total === 0}>
              <IconPdf /> Preview PDF
            </button>
            <button className="btn-review" onClick={handleReview}>
              Review and Place Order
            </button>
          </div>
        </div>

      </div>

      <PreviewModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        orderRows={orderRows}
        customerInfo={{
          contact_person: business?.contact_person || '-',
          business_name:  business?.name           || '-',
          phone:          business?.phone          || '-',
          address:        business?.address        || '-',
        }}
        total={total}
        onConfirm={handlePlaceOrder}
        loading={loading}
        submitError={submitError}
        paymentDone={paymentDone}
        screenshotFile={screenshotFile}
        screenshotPreview={screenshotPreview}
        onDownloadPdf={handleDownloadPdf}
      />
    </div>
  );
};

export default Order;