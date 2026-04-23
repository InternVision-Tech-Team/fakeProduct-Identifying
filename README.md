# FakeDetect – Anti-Counterfeit QR Platform

A full-stack product verification platform using **Django (DRF)** + **React (Vite)**, fully dockerised.
No database or payment integration — pure in-memory mock data for instant local development.

---

## 🚀 Quick Start (Docker)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Run everything with one command

```bash
docker compose up --build
```

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:5173      |
| Backend  | http://localhost:8000/api/ |

> First build takes ~2–3 minutes (npm install + pip install). Subsequent starts are fast.

---

## 🔑 Demo Login Credentials

| Role     | Email             | Password  |
|----------|-------------------|-----------|
| Brand    | brand@demo.com    | demo1234  |
| Admin    | admin@demo.com    | admin123  |
| Consumer | user@demo.com     | user1234  |

---

## 🧪 Test the Scanner

### Manual Input Codes (paste into Scanner → Manual Input):

| Code                          | Result   |
|-------------------------------|----------|
| `VERIFY-prod_001-ALPHA123`    | ✅ VERIFIED (first scan)  |
| `VERIFY-prod_001-BETA456`     | ⚠️ WARNING (already scanned) |
| `FAKE-CODE-XYZ`               | ❌ INVALID (not in DB)   |

Or go to **Demo Codes** page to see pre-generated QR images you can scan directly.

---

## 📁 Project Structure

```
fake-detector/
├── docker-compose.yml
├── backend/                  # Django + DRF
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── manage.py
│   ├── core/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── api/
│       ├── views.py          # All API logic + mock data
│       └── urls.py
└── frontend/                 # React + Vite
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js        # Proxies /api → backend:8000
    ├── tailwind.config.js
    └── src/
        ├── App.jsx           # Routes
        ├── api.js            # Axios instance
        ├── context/
        │   └── AuthContext.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── StatCard.jsx
        │   └── StatusBadge.jsx
        └── pages/
            ├── Home.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── Scanner.jsx       # Camera QR scanner + manual input
            ├── ScanResult.jsx
            ├── DemoCodes.jsx
            ├── Dashboard.jsx     # Charts + analytics
            ├── Products.jsx      # CRUD
            ├── QRGenerator.jsx   # Generate + download QR PNGs
            ├── ScanHistory.jsx
            └── NotFound.jsx
```

---

## 🔌 API Endpoints

| Method | Endpoint                  | Description                        |
|--------|---------------------------|------------------------------------|
| GET    | `/api/health/`            | Health check                       |
| POST   | `/api/auth/login/`        | Mock login → JWT tokens            |
| POST   | `/api/auth/register/`     | Mock registration                  |
| GET    | `/api/products/`          | List all products                  |
| POST   | `/api/products/`          | Create a product                   |
| GET    | `/api/products/<id>/`     | Get product detail                 |
| PUT    | `/api/products/<id>/`     | Update product                     |
| DELETE | `/api/products/<id>/`     | Delete product                     |
| POST   | `/api/qrcodes/generate/`  | Generate QR codes (returns PNG b64)|
| POST   | `/api/scan/`              | Core scan → VERIFIED/WARNING/INVALID|
| GET    | `/api/scans/history/`     | Consumer scan history              |
| GET    | `/api/dashboard/stats/`   | Brand analytics                    |
| GET    | `/api/demo/codes/`        | Pre-made demo QR images            |

---

## 🛠️ Development Without Docker

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

> The Vite proxy (`/api` → `http://localhost:8000`) handles CORS automatically in dev.

---

## 🗺️ Next Steps (to add later)

- [ ] PostgreSQL database (replace in-memory mock data)
- [ ] Celery + Redis for async bulk QR generation
- [ ] Stripe subscription billing
- [ ] Email verification on registration
- [ ] Geolocation tracking per scan (with user consent)
- [ ] PDF batch download of QR codes
- [ ] Admin panel with suspension controls
- [ ] Rate limiting by subscription tier
