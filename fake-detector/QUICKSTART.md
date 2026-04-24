# 🚀 FakeDetect - Quick Start Guide

## What You Got

A complete anti-counterfeit product verification platform with:
- **Django REST Framework** backend with mock in-memory data
- **React + Vite** frontend with QR scanning, dashboard, and analytics
- **Fully Dockerized** - runs with one command
- **No database setup needed** - uses in-memory mock data
- **No payment integration** - pure prototype

---

## 📦 Installation & Running

### Step 1: Extract the archive
```bash
tar -xzf fake-detector.tar.gz
cd fake-detector
```

### Step 2: Start everything with Docker
```bash
docker compose up --build
```

Wait 2-3 minutes for the first build (npm + pip dependencies).

### Step 3: Open your browser
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/health/

---

## 🎯 What to Test

### 1. Login as Brand User
- Email: `brand@demo.com`
- Password: `demo1234`
- Access: Dashboard, Products, QR Generator

### 2. Try the Scanner
Go to **Scan** → **Manual Input** and paste:
- `VERIFY-prod_001-ALPHA123` → ✅ VERIFIED
- `VERIFY-prod_001-BETA456` → ⚠️ WARNING (already scanned)
- `FAKE-CODE-XYZ` → ❌ INVALID

### 3. Generate QR Codes
1. Login as brand user
2. Go to **Products** → Add a new product
3. Go to **QR Generator** → Select your product → Generate
4. Download the QR code PNG
5. Scan it with the Scanner page!

### 4. View Analytics
- **Dashboard** shows charts, fake alerts, scan trends
- **History** shows all scan records

---

## 🛑 Stopping the App
```bash
docker compose down
```

---

## 📱 Features Included

✅ JWT Authentication (mock)
✅ QR Code Scanner (camera + manual input)
✅ Real-time verification (VERIFIED/WARNING/INVALID)
✅ Product CRUD management
✅ Bulk QR code generation with download
✅ Brand dashboard with charts (Recharts)
✅ Scan history tracking
✅ Demo QR codes for testing
✅ Responsive mobile-first design (Tailwind CSS)
✅ Role-based access (Admin/Brand/Consumer)

---

## 🔧 Tech Stack

**Backend:**
- Django 4.2 + Django REST Framework
- SimpleJWT for auth
- QRCode + Pillow for QR generation
- In-memory Python dictionaries (no DB)

**Frontend:**
- React 18 + Vite
- React Router v6
- Axios for API calls
- html5-qrcode for scanning
- Recharts for analytics
- Tailwind CSS + Lucide icons

**DevOps:**
- Docker + docker-compose
- Hot reload for both frontend and backend

---

## 📝 Project Structure

```
fake-detector/
├── docker-compose.yml       # Orchestrates backend + frontend
├── README.md                # Full documentation
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── manage.py
│   ├── core/                # Django settings
│   └── api/                 # REST API + mock data
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js       # Proxies /api to backend
    └── src/
        ├── pages/           # All UI pages
        ├── components/      # Reusable components
        └── context/         # Auth state
```

---

## 🎨 Demo Accounts

| Role      | Email            | Password  |
|-----------|------------------|-----------|
| Brand     | brand@demo.com   | demo1234  |
| Admin     | admin@demo.com   | admin123  |
| Consumer  | user@demo.com    | user1234  |

---

## 🔮 Future Enhancements (NOT included)

These would be the next steps to make it production-ready:

- [ ] PostgreSQL database
- [ ] Stripe subscription billing
- [ ] Celery + Redis for async tasks
- [ ] Email verification
- [ ] PDF batch QR export
- [ ] Geolocation tracking
- [ ] Rate limiting per tier
- [ ] Production deployment config

---

## ❓ Troubleshooting

### Port already in use?
```bash
# Check what's using the ports
lsof -i :5173
lsof -i :8000

# Change ports in docker-compose.yml:
ports:
  - "3000:5173"  # Frontend
  - "9000:8000"  # Backend
```

### Camera not working in Scanner?
- Use HTTPS (camera requires secure context)
- Or use **Manual Input** mode instead
- Or test with the **Demo Codes** page

### Backend health check failing?
```bash
# Check logs
docker compose logs backend

# Common fix: rebuild
docker compose down
docker compose up --build
```

---

## 📧 Need Help?

Check the full `README.md` in the project root for:
- Complete API endpoint list
- Development setup without Docker
- Detailed architecture breakdown

---

**Happy coding! 🚀**
