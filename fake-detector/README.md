# FakeDetect – Anti-Counterfeit QR Platform

A full-stack product verification platform using **Django (DRF)** + **React (Vite)** with **MySQL** for local data storage.
Production-ready with persistent database storage and easy local development.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.14+ and pip
- Node.js 20+
- Local MySQL server installed and running

### Start the application locally

```bash
cd backend
c:/Users/tanis/Desktop/fake-detector/.venv/Scripts/python.exe -m pip install -r requirements.txt
c:/Users/tanis/Desktop/fake-detector/.venv/Scripts/python.exe manage.py migrate
c:/Users/tanis/Desktop/fake-detector/.venv/Scripts/python.exe manage.py runserver
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

**What happens:**
- Local MySQL database is used for persistent storage
- Django backend applies migrations and starts on port 8000
- React frontend runs with Vite on port 5173

| Service  | URL                        | Status |
|----------|----------------------------|--------|
| Frontend | http://localhost:5173      | ✅ React |
| Backend  | http://localhost:8000/api/ | ✅ Django |
| Database | mysql://localhost:3306     | ✅ MySQL |

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
✅ **MySQL** for persistent local data storage
✅ **Auto-migrations** run locally with Django
✅ **8 comprehensive models** with relationships
✅ **Indexed queries** for performance
✅ **Local database persistence** survives restarts
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
├── README.md
├── backend/
│   ├── requirements.txt         # mysql-connector-python for MySQL
│   ├── manage.py
│   ├── core/
│   │   ├── settings.py          # MySQL configuration
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
mysqldump -u root -p fakedetect > backup.sql
```

### View Database Stats
```bash
mysql -u root -p -e "SELECT COUNT(*) as scan_records FROM scan_records; SELECT COUNT(*) as products FROM products; SELECT COUNT(*) as users FROM users;" fakedetect
```

### Connect to Database CLI
```bash
mysql -u root -p fakedetect
```

Then run SQL commands (e.g., `SHOW TABLES;` to list tables, `exit` to close the client).

---

## 🛠️ Development Without Docker

### Backend
```bash
cd backend

# Activate your virtual environment
c:/Users/tanis/Desktop/fake-detector/.venv/Scripts/python.exe -m pip install -r requirements.txt

# Install local MySQL server and ensure it is running
# Configure MySQL credentials for your environment
set DB_HOST=127.0.0.1
set DB_NAME=fakedetect
set DB_USER=root
set DB_PASSWORD=root

# Create the database and run migrations
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS fakedetect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
c:/Users/tanis/Desktop/fake-detector/.venv/Scripts/python.exe manage.py migrate

# Create admin user
c:/Users/tanis/Desktop/fake-detector/.venv/Scripts/python.exe manage.py createsuperuser

# Start server
c:/Users/tanis/Desktop/fake-detector/.venv/Scripts/python.exe manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Database Security

- Use strong local MySQL passwords and never store secrets in source control
- Use environment variables for `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, and `DB_NAME`
- Enable TLS for MySQL in production
- Apply regular backups of your local database

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
✅ MySQL persistence with migrations

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

### Database Connection Issues
```bash
mysql -u root -p -e "SELECT 1;"
```

### Migration Errors
```bash
cd backend
c:/Users/tanis/Desktop/fake-detector/.venv/Scripts/python.exe manage.py migrate
```

### Reset Database
```bash
mysql -u root -p -e "DROP DATABASE IF EXISTS fakedetect; CREATE DATABASE fakedetect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
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
- MySQL (local development)
- SimpleJWT authentication
- mysql-connector-python driver

**Frontend:**
- React 18 + Vite
- React Router v6
- Axios + Recharts
- Tailwind CSS

**Development:**
- Local Python virtual environment
- Local MySQL database
- Vite development server

---

**Happy coding! 🚀**
