# Sheetal Ice-Cream Website

A B2B ordering platform for Sheetal Ice-Cream Udhyog. Registered businesses log in, browse the flavour catalogue, and place bulk orders. Admins manage orders, businesses, and status updates from a central dashboard.

---

## Tech Stack

| Layer    | Technology                                    |
|----------|-----------------------------------------------|
| Frontend | React 18, Vite — hosted on Vercel             |
| Backend  | Django 5, Django REST Framework — hosted on Railway |
| Database | PostgreSQL — Neon (cloud) / local             |

---

## Local Development

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL running locally

### Backend

```bash
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac / Linux

pip install -r backend/requirements.txt

cd backend
python manage.py migrate
python manage.py runserver
```

API available at `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend available at `http://localhost:5173`

---

## Environment Variables

**`backend/.env`**

```env
SECRET_KEY=django-insecure-changethisinproduction
DEBUG=True

DB_NAME=icecream_db
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
```

In production, Railway sets `DATABASE_URL` automatically. The app detects it and switches to the Neon database with SSL enabled.

**`frontend/.env`**

```env
VITE_API_URL=http://localhost:8000/api
```

In production, set this to your Railway backend URL.

---

## Running Tests

```bash
cd backend
python manage.py test icecream_api
```

---

## Django Admin

Available at `/admin/`. Create a superuser to access it:

```bash
python manage.py createsuperuser
```