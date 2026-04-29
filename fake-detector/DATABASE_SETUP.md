# 🗄️ MySQL Database Integration Guide

## Overview

The FakeDetect application now uses **MySQL** for persistent data storage. This guide covers local MySQL configuration, Django migration setup, and database management without Docker.

---

## 🚀 Quick Start

### 1. Install and Start MySQL

Install a local MySQL server for Windows and ensure it is running.

### 2. Configure Backend Database Settings

In `backend/core/settings.py`, use environment variables or defaults:

```python
DATABASES = {
    'default': {
        'ENGINE': 'mysql.connector.django',
        'NAME': os.environ.get('DB_NAME', 'fakedetect'),
        'USER': os.environ.get('DB_USER', 'root'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', '127.0.0.1'),
        'PORT': os.environ.get('DB_PORT', '3306'),
    }
}
```

### 3. Install Python Dependencies

```bash
cd backend
c:/Users/tanis/Desktop/fake-detector/.venv/Scripts/python.exe -m pip install -r requirements.txt
```

### 4. Create Database and Run Migrations

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS fakedetect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
c:/Users/tanis/Desktop/fake-detector/.venv/Scripts/python.exe manage.py migrate
```

### 5. Start the Backend

```bash
c:/Users/tanis/Desktop/fake-detector/.venv/Scripts/python.exe manage.py runserver
```

---

## 📋 Database Schema

### Tables Created:

1. **users** - User accounts (extended Django auth model)
2. **products** - Product catalog
3. **qr_codes** - Unique QR codes for products
4. **scan_records** - Individual scan records
5. **reports** - Reports for suspicious products
6. **subscription_plans** - Available subscription tiers
7. **brand_subscriptions** - Brand subscription status
8. **brands** - Brand/Manufacturer profiles (optional, for future use)

---

## 🔧 Manual Migrations (if needed)

### Create a New Migration

If you modify the models, create a migration:

```bash
cd backend
c:/Users/tanis/Desktop/fake-detector/.venv/Scripts/python.exe manage.py makemigrations api
```

### Apply Migrations

```bash
cd backend
c:/Users/tanis/Desktop/fake-detector/.venv/Scripts/python.exe manage.py migrate
```

### View Migration Status

```bash
cd backend
c:/Users/tanis/Desktop/fake-detector/.venv/Scripts/python.exe manage.py showmigrations
```

### Rollback a Migration

```bash
cd backend
c:/Users/tanis/Desktop/fake-detector/.venv/Scripts/python.exe manage.py migrate api 0001
```

---

## 💾 Database Backup & Restore

### Backup the Database

```bash
mysqldump -u root -p fakedetect > fakedetect_backup.sql
```

### Restore from Backup

```bash
mysql -u root -p fakedetect < fakedetect_backup.sql
```

### Export Data as CSV

```bash
mysql -u root -p -e "SELECT * FROM scan_records" fakedetect > scans_export.csv
mysql -u root -p -e "SELECT * FROM products" fakedetect > products_export.csv
```

---

## 🔑 Environment Variables

The database connection can be configured via environment variables for local development:

```bash
set DB_NAME=fakedetect
set DB_USER=root
set DB_PASSWORD=
set DB_HOST=127.0.0.1
set DB_PORT=3306
```

---

## 🔐 Create Superuser (Admin Account)

```bash
cd backend
c:/Users/tanis/Desktop/fake-detector/.venv/Scripts/python.exe manage.py createsuperuser
```

---

## 📊 Connect to Database Directly

### Using MySQL CLI

```bash
mysql -u root -p fakedetect
```

Then run SQL queries:

```sql
-- View all tables
SHOW TABLES;

-- Check row counts
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM scan_records;
```

### Using Local MySQL GUI Tools

**DBeaver (Free):**
```
Connection details:
- Host: localhost
- Port: 3306
- Database: fakedetect
- Username: root
- Password: root
```

**MySQL Workbench:**
```
Connection details:
- Host: localhost
- Port: 3306
- Username: root
- Password: root
```

---

## 🔍 Common Database Operations

### View Database Size

```bash
mysql -u root -p -e "SELECT table_schema AS db_name, SUM(data_length + index_length) AS size_bytes FROM information_schema.tables WHERE table_schema='fakedetect' GROUP BY table_schema;"
```

### Check Table Sizes

```bash
mysql -u root -p -e "SELECT table_name, ROUND((data_length + index_length) / 1024 / 1024, 2) AS size_mb FROM information_schema.tables WHERE table_schema='fakedetect' ORDER BY size_mb DESC;"
```

### View Active Connections

```bash
mysql -u root -p -e "SHOW PROCESSLIST;"
```

### Reset Database (⚠️ WARNING: Deletes all data)

```bash
mysql -u root -p -e "DROP DATABASE IF EXISTS fakedetect; CREATE DATABASE fakedetect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

---

## 🚨 Troubleshooting

### Database Connection Refused

```bash
mysqladmin -u root -p ping
```

### Migration Errors

```bash
cd backend
c:/Users/tanis/Desktop/fake-detector/.venv/Scripts/python.exe manage.py migrate
```

### Reset Migrations

```bash
cd backend
c:/Users/tanis/Desktop/fake-detector/.venv/Scripts/python.exe manage.py migrate api zero
c:/Users/tanis/Desktop/fake-detector/.venv/Scripts/python.exe manage.py makemigrations api
c:/Users/tanis/Desktop/fake-detector/.venv/Scripts/python.exe manage.py migrate
```

### Password Reset

```bash
cd backend
c:/Users/tanis/Desktop/fake-detector/.venv/Scripts/python.exe manage.py changepassword admin
```

---

## 📈 Performance Optimization

### Index Recommendations

```sql
CREATE INDEX idx_qr_code_hash ON qr_codes(code_hash);
CREATE INDEX idx_scan_records_created ON scan_records(created_at);
CREATE INDEX idx_products_brand_user ON products(brand_user_id);
```

### Query Optimization

```sql
EXPLAIN SELECT * FROM scan_records WHERE status = 'warning';
```

---

## 🔄 Data Migration from Mock to Real Database

When moving from in-memory mock data to MySQL:

1. **Create the database:**
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS fakedetect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

2. **Run migrations:**
   ```bash
   cd backend
   c:/Users/tanis/Desktop/fake-detector/.venv/Scripts/python.exe manage.py migrate
   ```

3. **Seed initial data** (optional):
   ```bash
   cd backend
   c:/Users/tanis/Desktop/fake-detector/.venv/Scripts/python.exe manage.py loaddata initial_data.json
   ```

4. **Verify data:**
   ```bash
   mysql -u root -p -e "SELECT COUNT(*) FROM products;" fakedetect
   ```

---

## 📝 Django ORM vs Raw SQL

The application uses Django ORM for most operations, but you can also use raw SQL:

### Using Django ORM (Recommended)

```python
from api.models import Product

products = Product.objects.filter(brand_user_id=user_id)
scan_count = product.qr_codes.aggregate(total=Sum('total_scans'))
```

### Using Raw SQL (When Needed)

```python
from django.db import connection

with connection.cursor() as cursor:
    cursor.execute(
        "SELECT COUNT(*) FROM products WHERE brand_user_id = %s",
        [user_id]
    )
    count = cursor.fetchone()[0]
```

---

## ✅ Verification Checklist

- [ ] Local MySQL server is running
- [ ] Database exists: `mysql -u root -p -e "SHOW DATABASES;"`
- [ ] Migrations applied: `cd backend && c:/Users/tanis/Desktop/fake-detector/.venv/Scripts/python.exe manage.py showmigrations`
- [ ] Tables created: `mysql -u root -p -e "USE fakedetect; SHOW TABLES;"`
- [ ] Can login to admin: `http://localhost:8000/admin`
- [ ] API working: `curl http://localhost:8000/api/health/`

---

## 📚 Further Reading

- [Django Database Documentation](https://docs.djangoproject.com/en/4.2/ref/databases/mysql/)
- [MySQL Official Docs](https://dev.mysql.com/doc/)

---

**Need help?** Check the backend logs:
```bash
cd backend
c:/Users/tanis/Desktop/fake-detector/.venv/Scripts/python.exe manage.py runserver
```
