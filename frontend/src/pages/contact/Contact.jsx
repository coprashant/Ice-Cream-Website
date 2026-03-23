import React from 'react';
import './Contact.css';

const IconPhone    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
const IconMail     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IconFacebook = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>;
const IconPin      = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconClock    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconMessage  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const IconChannels = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
const IconArrow    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;

const ContactItem = ({ icon, label, value, href }) => (
  <a
    className="contact-item"
    href={href}
    target={href?.startsWith('http') ? '_blank' : undefined}
    rel="noreferrer"
  >
    <div className="contact-icon-wrap">{icon}</div>
    <div className="contact-item-info">
      <span className="contact-item-label">{label}</span>
      <span className="contact-item-value">{value}</span>
    </div>
    <span className="contact-arrow"><IconArrow /></span>
  </a>
);

const Contact = () => {
  return (
    <div className="contact-page">
      <div className="contact-container">

        <div className="contact-header">
          <span className="section-eyebrow">Get In Touch</span>
          <h1 className="contact-title">
            We'd Love to<br />
            <span className="title-accent">Hear from You</span>
          </h1>
          <p className="contact-sub">Questions, orders, or just want to say hi? Reach out anytime.</p>
        </div>

        <div class="contact-layout">
          {/* Contact channels */}
          <div className="contact-card">
            <h3 className="card-section-title">
              <span className="card-title-icon"><IconChannels /></span>
              Contact Channels
            </h3>
            <div className="contact-list">
              <ContactItem
                icon={<IconPhone />}
                label="Phone 1"
                value="98xxxxxxxx"
                href="tel:+9779811111111"
              />
              <ContactItem
                icon={<IconPhone />}
                label="Phone 2"
                value="98xxxxxxxx"
                href="tel:+9779800000000"
              />
              <ContactItem
                icon={<IconMail />}
                label="Email"
                value="sheetal.icecream@gmail.com"
                href="mailto:sheetal.icecream@gmail.com"
              />
              <ContactItem
                icon={<IconFacebook />}
                label="Facebook"
                value="Prasant Bhattarai"
                href="https://www.facebook.com"
              />
            </div>
          </div>

          {/* Location and hours */}
          <div className="contact-card location-card">
            <h3 className="card-section-title">
              <span className="card-title-icon"><IconPin /></span>
              Find Us
            </h3>
            <div className="location-display">
              <div className="location-pin-wrap"><IconPin /></div>
              <div className="location-text">
                <p className="location-main">Thapathali</p>
                <p className="location-secondary">Kathmandu, Nepal</p>
              </div>
            </div>
            <div className="hours-block">
              <div className="hours-row">
                <span className="hours-days">
                  <IconClock /> Mon – Sat
                </span>
                <span className="hours-time">9:00 AM – 9:00 PM</span>
              </div>
              <div className="hours-row">
                <span className="hours-days">
                  <IconClock /> Sunday
                </span>
                <span className="hours-time">10:00 AM – 8:00 PM</span>
              </div>
            </div>
          </div>

          {/* Email CTA */}
          <div className="contact-card message-card">
            <h3 className="card-section-title">
              <span className="card-title-icon"><IconMessage /></span>
              Send a Message
            </h3>
            <p className="message-card-sub">
              For bulk orders or business inquiries, send us a message and we'll get back to you within 24 hours.
            </p>
            <a
              href="mailto:sheetal.icecream@gmail.com?subject=Inquiry from Website"
              className="btn-primary email-btn"
            >
              <IconMail /> Email Us
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;