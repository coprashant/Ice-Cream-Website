# 🍦 Sheetal Ice Cream — React Frontend

A modern React.js rewrite of the Sheetal Ice Cream website with a clean artisan aesthetic.

---

## 📁 Project Structure

```
sheetal-icecream/
├── public/
│   └── index.html
└── src/
    ├── index.js               ← Entry point
    ├── index.css              ← Global styles & CSS variables (light/dark)
    ├── App.jsx                ← Root component with routing
    ├── context/
    │   └── ThemeContext.jsx   ← Light/dark theme state
    ├── data/
    │   └── flavours.js        ← All flavour data (single source of truth)
    ├── components/
    │   ├── Header.jsx/.css    ← Sticky header, nav, theme toggle, hamburger
    │   └── Footer.jsx/.css    ← Footer with nav links & contact
    └── pages/
        ├── Home.jsx/.css      ← Hero, info strip, flavour cards
        ├── Order.jsx/.css     ← Order form with preview modal
        └── Contact.jsx/.css   ← Contact channels, location, hours
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v16+ installed
- npm v7+

### Install & Run

```bash
# Navigate to project directory
cd sheetal-icecream

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at **http://localhost:3000**

---

## 🎨 Design System

All design tokens are CSS variables in `src/index.css`:

| Variable | Purpose |
|---|---|
| `--accent-primary` | Brand blue (#2E7EAA) |
| `--accent-warm` | Warm orange accent |
| `--card-bg` | Card/form backgrounds |
| `--text-primary` | Main text |
| `--border-color` | All borders |

Dark mode overrides are scoped to `body.dark-mode`.

**Fonts:** Playfair Display (headings) + DM Sans (body)

---

## 🔗 Backend Integration

The Order page sends POST requests to your Java backend:

```
POST http://localhost:8080/api/orders/place
Content-Type: application/json

{
  "businessId": "<from localStorage>",
  "totalAmount": 340.00,
  "status": "Pending",
  "customerName": "...",
  "customerPhone": "...",
  "customerAddress": "...",
  "items": [
    { "itemName": "Vanilla", "quantity": 2, "price": 150 }
  ]
}
```

---

## ✨ Features

- **Single-page app** with client-side navigation
- **Light/dark mode** with localStorage persistence
- **Responsive** — works on mobile, tablet, desktop
- **Animated hero** with floating blobs and ice cream emojis
- **Scroll-triggered** flavour card animations
- **Sticky header** that shrinks on scroll
- **Hamburger menu** for mobile
- **Order form** with inline validation, qty stepper, and preview modal
- **Backend-ready** fetch API call to your Java Spring Boot server

---

## 🔮 Adding Admin / Customer History (Future)

For the B2B admin panel and order history:
1. Add a `Login.jsx` page with role-based auth (admin/customer)
2. Create `AdminDashboard.jsx` to view all orders
3. Create `OrderHistory.jsx` for customers to track past orders
4. Store JWT token in localStorage and include in API headers
