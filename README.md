# 🍦 Sheetal Ice-Cream Website

A B2B ice cream ordering platform. Businesses log in, browse flavours, and place bulk orders. Admins manage orders and businesses from a central dashboard.

---

## Project Structure

```
Sheetal Ice-Cream Website/
├── backend/                    ← Django REST API
│   ├── manage.py
│   ├── requirements.txt
│   ├── icecream_project/       ← Project config (settings, root URLs)
│   │   ├── settings.py
│   │   └── urls.py
│   └── icecream_api/           ← Application code
│       ├── models.py           ← Database tables
│       ├── serializers.py      ← JSON conversion & validation
│       ├── views.py            ← API endpoint logic
│       ├── urls.py             ← API route definitions
│       ├── admin.py            ← Django admin panel config
│       ├── tests.py            ← Automated tests
│       └── migrations/         ← Auto-generated database migrations
│
├── frontend/                   ← React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── ...
│   └── package.json
│
├── database/
│   └── icecream_db.sql         ← Reference SQL schema
│
├── .gitignore
└── README.md
```

---

## Backend Setup

### Requirements
- Python 3.10+

### 1. Create and activate virtual environment

```bash
# From the project root
python -m venv venv

# Mac / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r backend/requirements.txt
```

### 3. Run database migrations

```bash
cd backend
python manage.py makemigrations icecream_api
python manage.py migrate
```

### 4. Create an admin account

```bash
# This creates a superuser for the Django admin panel at /admin/
python manage.py createsuperuser
```

### 5. Start the development server

```bash
python manage.py runserver
```

API is now live at: **http://localhost:8000**

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## API Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/login` | Log in and get user info | Public |
| GET | `/api/businesses/` | List all businesses | Admin |
| GET | `/api/orders/` | List orders | Admin (all) / Customer (own) |
| POST | `/api/orders/place` | Place a new order | Any authenticated user |
| PATCH | `/api/orders/<id>/status` | Update order status | Admin |
| GET | `/api/admin/logs/` | View audit log | Admin |

### Example: Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "yourusername", "password": "yourpassword"}'
```

### Example: Place an Order

```bash
curl -X POST http://localhost:8000/api/orders/place \
  -H "Content-Type: application/json" \
  -d '{
    "business": 1,
    "items": [
      {"item_name": "Vanilla Tub",  "quantity": 2, "price": 4.50},
      {"item_name": "Choc Scoop",   "quantity": 5, "price": 1.20}
    ]
  }'
```

### Example: Update Order Status (Admin)

```bash
curl -X PATCH http://localhost:8000/api/orders/1/status \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 1" \
  -d '{"status": "Confirmed"}'
```

---

## Running Tests

```bash
cd backend
python manage.py test icecream_api
```

---

## Django Admin Panel

Visit **http://localhost:8000/admin/** to manage all data through a built-in UI.

Log in with the superuser account you created in setup step 4.

---

## Database

The project uses **SQLite by default** (no setup needed for development).

To switch to PostgreSQL or MySQL, update the `DATABASES` setting in `backend/icecream_project/settings.py`. The reference SQL schema is in `database/icecream_db.sql`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, CSS Modules |
| Backend | Python, Django 5, Django REST Framework |
| Database | SQLite (dev) / PostgreSQL or MySQL (prod) |
| CORS | django-cors-headers |