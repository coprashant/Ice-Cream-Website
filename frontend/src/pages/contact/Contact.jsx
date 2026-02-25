import React from 'react';
import './Contact.css';

const ContactItem = ({ icon, label, value, href }) => (
  <a className="contact-item" href={href} target={href?.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
    <div className="contact-icon-wrap">{icon}</div>
    <div className="contact-item-info">
      <span className="contact-item-label">{label}</span>
      <span className="contact-item-value">{value}</span>
    </div>
    <span className="contact-arrow">→</span>
  </a>
);

const Contact = () => {
  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-header">
          <span className="section-eyebrow">Get In Touch</span>
          <h1 className="contact-title">We'd Love to<br /><span className="title-accent">Hear from You</span></h1>
          <p className="contact-sub">Questions, orders, or just want to say hi? Reach out anytime.</p>
        </div>

        <div className="contact-layout">
          <div className="contact-card">
            <h3 className="card-section-title">📞 Contact Channels</h3>
            <div className="contact-list">
              <ContactItem
                icon="📱"
                label="Phone 1"
                value="9841550000"
                href="tel:+9779841550000"
              />
              <ContactItem
                icon="📱"
                label="Phone 2"
                value="9861187473"
                href="tel:+9779861187473"
              />
              <ContactItem
                icon="✉️"
                label="Email"
                value="sheetal.icecream@gmail.com"
                href="mailto:sheetal.icecream@gmail.com"
              />
              <ContactItem
                icon="📘"
                label="Facebook"
                value="Indira Bhattarai Karki"
                href="https://www.facebook.com/indira.bhattaraikarki"
              />
            </div>
          </div>

          <div className="contact-card location-card">
            <h3 className="card-section-title">📍 Find Us</h3>
            <div className="location-display">
              <div className="location-pin">📌</div>
              <div className="location-text">
                <p className="location-main">Prakritinagar, Gokarneshwor-8</p>
                <p className="location-secondary">Kathmandu, Nepal</p>
              </div>
            </div>
            <div className="hours-block">
              <div className="hours-row">
                <span>Mon – Sat</span>
                <span className="hours-time">9:00 AM – 9:00 PM</span>
              </div>
              <div className="hours-row">
                <span>Sunday</span>
                <span className="hours-time">10:00 AM – 8:00 PM</span>
              </div>
            </div>
          </div>

          <div className="contact-card message-card">
            <h3 className="card-section-title">💬 Send a Message</h3>
            <p className="message-card-sub">
              For bulk orders or business inquiries, send us a message and we'll get back to you within 24 hours.
            </p>
            <a
              href="mailto:sheetal.icecream@gmail.com?subject=Inquiry from Website"
              className="btn-primary email-btn"
            >
              ✉️ Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
