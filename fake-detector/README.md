# FakeDetect – Anti-Counterfeit QR Platform

A full-stack product verification platform using **Django (DRF)** + **React (Vite)** with **PostgreSQL**, fully dockerised.
Production-ready with persistent data storage and comprehensive database integration.

---

## 🚀 Quick Start (Docker)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Run everything with one command

```bash
docker compose up --build
```

**What happens:**
- PostgreSQL database starts (auto-creates tables via migrations)
- Django backend initializes with migrations
- React frontend builds with Vite
- Everything connected and ready to use

| Service  | URL                        | Status |
|----------|----------------------------|--------|
| Frontend | http://localhost:5173      | ✅ React |
| Backend  | http://localhost:8000/api/ | ✅ Django |
| Database | postgres://localhost:5432 | ✅ PostgreSQL |

> First build takes ~2–3 minutes. Subsequent starts are fast.

---

## 🔑 Demo Login Credentials

| Role     | Email             | Password  |
|----------|-------------------|-----------|
| Brand    | brand@demo.com    | demo1234  |
| Admin    | admin@demo.com    | admin123  |
| Consumer | user@demo.com     | user1234  |

---

## 🗄️ Database Integration

### What's New:
✅ **PostgreSQL** for persistent data storage
✅ **Auto-migrations** run on startup
✅ **8 comprehensive models** with relationships
✅ **Indexed queries** for performance
✅ **Volume persistence** survives restarts
✅ **Production-ready** schema

### Models:
1. **User** – Extended auth with role-based access (consumer, brand, admin)
2. **Product** – Product catalog with SKU, batch, expiry tracking
3. **QRCode** – Unique cryptographic codes with scan tracking
4. **ScanRecord** – Individual scans with geolocation and IP logging
5. **Report** – User reports for counterfeit products
6. **SubscriptionPlan** – Tier definitions (free, basic, professional, enterprise)
7. **BrandSubscription** – Brand subscription status and usage tracking
8. **Brand** – Brand/Manufacturer profiles (optional, for future expansion)

---

## 📁 Project Structure

```
fake-detector/
├── docker-compose.yml          # PostgreSQL + Backend + Frontend
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt         # psycopg2 for PostgreSQL
│   ├── manage.py
│   ├── core/
│   │   ├── settings.py          # PostgreSQL configuration
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── api/
│   │   ├── models.py            # 8 models with indexes
│   │   ├── views.py             # REST API endpoints
│   │   ├── serializers.py       # DRF serializers
│   │   ├── urls.py
│   │   └── migrations/          # Auto-generated DB migrations
│   └── requirements.txt
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    └── src/                     # React + Vite
```

---

## 🔌 API Endpoints

| Method | Endpoint                  | Description                        |
|--------|---------------------------|------------------------------------|
| GET    | `/api/health/`            | Health check                       |
| POST   | `/api/auth/login/`        | User login                         |
| POST   | `/api/auth/register/`     | User registration                  |
| GET    | `/api/products/`          | List products                      |
| POST   | `/api/products/`          | Create product                     |
| GET    | `/api/products/<id>/`     | Get product detail                 |
| PUT    | `/api/products/<id>/`     | Update product                     |
| DELETE | `/api/products/<id>/`     | Delete product (soft delete)       |
| POST   | `/api/qrcodes/generate/`  | Generate QR codes                  |
| POST   | `/api/scan/`              | Scan QR code (core endpoint)       |
| GET    | `/api/scans/history/`     | Get user's scan history            |
| GET    | `/api/dashboard/stats/`   | Brand analytics dashboard          |

---

## 🧪 Test the Scanner

### Manual Input Codes:

| Code                          | Expected Result |
|-------------------------------|-----------------|
| `VERIFY-prod_001-ALPHA123`    | ✅ VERIFIED      |
| `VERIFY-prod_001-BETA456`     | ⚠️ WARNING       |
| `FAKE-CODE-XYZ`               | ❌ INVALID       |

---

## 💾 Database Management

### Backup Database
```bash
docker compose exec db pg_dump -U postgres fakedetect > backup.sql
```

### View Database Stats
```bash
docker compose exec db psql -U postgres -d fakedetect \
  -c "SELECT COUNT(*) as scan_records FROM scan_records; \
      SELECT COUNT(*) as products FROM products; \
      SELECT COUNT(*) as users FROM users;"
```

### Connect to Database CLI
```bash
docker compose exec db psql -U postgres -d fakedetect
```

Then run SQL commands (e.g., `\dt` to list tables, `\q` to exit).

---

## 🛠️ Development Without Docker

### Backend
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up PostgreSQL (must be running locally)
export DB_HOST=localhost
export DB_NAME=fakedetect
export DB_USER=postgres
export DB_PASSWORD=postgres

# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

> For local development, PostgreSQL must be installed and running.

---

## 🔐 Database Security

- Change `POSTGRES_PASSWORD` in `docker-compose.yml`
- Use `django-environ` for production secrets
- Enable SSL for database connections in production
- Implement row-level security policies
- Regular backups of production database

---

## 📊 Key Features Implemented

✅ User authentication with roles (consumer, brand, admin)
✅ Product CRUD with categorization
✅ Unique cryptographic QR code generation
✅ Real-time scan verification (VERIFIED/WARNING/INVALID)
✅ Geolocation tracking per scan
✅ Duplicate scan detection (counterfeit alerts)
✅ User report system for suspicious products
✅ Subscription tier management
✅ Dashboard analytics with charts
✅ Scan history tracking
✅ Mobile-responsive UI
✅ PostgreSQL persistence with migrations

---

## 🔮 Future Enhancements

- [ ] Celery + Redis for async QR generation
- [ ] Stripe payment integration
- [ ] Email verification
- [ ] PDF batch export
- [ ] Admin suspension controls
- [ ] Rate limiting by tier
- [ ] Multi-language support
- [ ] AWS/GCP deployment
- [ ] GraphQL API
- [ ] WebSocket for real-time alerts

---

## 🚨 Troubleshooting

### Database Not Starting
```bash
docker compose logs db
docker compose restart db
```

### Migration Errors
```bash
docker compose exec backend python manage.py migrate api zero
docker compose exec backend python manage.py migrate
```

### Reset Everything
```bash
docker compose down -v  # WARNING: Deletes database
docker compose up --build
```

---

## 📚 Documentation

- **SQL Queries** → `SQL_QUERIES.md` (comprehensive database queries)
- **Database Setup** → `DATABASE_SETUP.md` (detailed guide)
- **Quick Start** → `QUICKSTART.md` (rapid testing)

---

## 🛠️ Tech Stack

**Backend:**
- Django 4.2 + Django REST Framework
- PostgreSQL 15 (persistent)
- SimpleJWT authentication
- psycopg2-binary driver

**Frontend:**
- React 18 + Vite
- React Router v6
- Axios + Recharts
- Tailwind CSS

**DevOps:**
- Docker + docker-compose
- Auto-migrations on startup
- Volume persistence

---

**Happy coding! 🚀**
