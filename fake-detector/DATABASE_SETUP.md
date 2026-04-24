# 🗄️ PostgreSQL Database Integration Guide

## Overview

The FakeDetect application now uses **PostgreSQL** for persistent data storage. The database is fully containerized and automatically created when you run `docker compose up`.

---

## 🚀 Quick Start

### 1. Start the Application with Database

```bash
docker compose up --build
```

**What happens automatically:**
- PostgreSQL container starts and creates the `fakedetect` database
- Django migrations run automatically
- Tables are created from models
- Backend server starts on `http://localhost:8000`
- Frontend starts on `http://localhost:5173`

### 2. Verify Database Connection

```bash
# Check if database is running
docker compose ps

# View database logs
docker compose logs db

# Connect to PostgreSQL directly
docker compose exec db psql -U postgres -d fakedetect
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
# Inside the backend container
docker compose exec backend python manage.py makemigrations api

# Or outside container
cd backend
python manage.py makemigrations api
```

### Apply Migrations

```bash
# Inside container (automatic on startup)
docker compose exec backend python manage.py migrate

# Or outside container
cd backend
python manage.py migrate
```

### View Migration Status

```bash
docker compose exec backend python manage.py showmigrations
```

### Rollback a Migration

```bash
docker compose exec backend python manage.py migrate api 0001
```

---

## 💾 Database Backup & Restore

### Backup the Database

```bash
# Create a SQL dump
docker compose exec db pg_dump -U postgres fakedetect > fakedetect_backup.sql

# Or as PostgreSQL binary format (more efficient)
docker compose exec db pg_dump -U postgres -Fc fakedetect > fakedetect_backup.dump
```

### Restore from Backup

```bash
# From SQL dump
docker compose exec -T db psql -U postgres -d fakedetect < fakedetect_backup.sql

# From binary dump
docker compose exec db pg_restore -U postgres -d fakedetect fakedetect_backup.dump
```

### Export Data as CSV

```bash
# Export scan records
docker compose exec db psql -U postgres -d fakedetect \
  -c "COPY scan_records TO STDOUT WITH CSV HEADER" > scans_export.csv

# Export products
docker compose exec db psql -U postgres -d fakedetect \
  -c "COPY products TO STDOUT WITH CSV HEADER" > products_export.csv
```

---

## 🔑 Environment Variables

The database connection is configured via environment variables in `docker-compose.yml`:

```yaml
environment:
  - DB_NAME=fakedetect          # Database name
  - DB_USER=postgres            # Database user
  - DB_PASSWORD=postgres        # Database password
  - DB_HOST=db                  # Container name
  - DB_PORT=5432               # PostgreSQL default port
```

### Change Database Credentials

Edit `docker-compose.yml`:

```yaml
db:
  environment:
    - POSTGRES_DB=my_custom_db
    - POSTGRES_USER=my_user
    - POSTGRES_PASSWORD=secure_password_123
```

---

## 🔐 Create Superuser (Admin Account)

```bash
docker compose exec backend python manage.py createsuperuser

# Or use specific credentials
docker compose exec backend python manage.py createsuperuser --username=admin --email=admin@example.com --noinput
# Then set password manually
```

---

## 📊 Connect to Database Directly

### Using psql (PostgreSQL CLI)

```bash
docker compose exec db psql -U postgres -d fakedetect
```

Then run SQL queries:

```sql
-- View all tables
\dt

-- Check row counts
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM scan_records;

-- View schema
\d+ products

-- Exit
\q
```

### Using PostgreSQL GUI Tools

**DBeaver (Free):**
```
Connection details:
- Host: localhost
- Port: 5432
- Database: fakedetect
- Username: postgres
- Password: postgres
```

**pgAdmin:**
```bash
# Add this service to docker-compose.yml if needed:
pgadmin:
  image: dpage/pgadmin4
  environment:
    PGADMIN_DEFAULT_EMAIL: admin@example.com
    PGADMIN_DEFAULT_PASSWORD: admin
  ports:
    - "5050:80"
```

---

## 🔍 Common Database Operations

### View Database Size

```bash
docker compose exec db psql -U postgres -d fakedetect -c "SELECT pg_size_pretty(pg_database_size('fakedetect'));"
```

### Check Table Sizes

```bash
docker compose exec db psql -U postgres -d fakedetect << EOF
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
EOF
```

### View Active Connections

```bash
docker compose exec db psql -U postgres -c "SELECT * FROM pg_stat_activity WHERE datname = 'fakedetect';"
```

### Reset Database (⚠️ WARNING: Deletes all data)

```bash
# Option 1: Drop and recreate database
docker compose exec db psql -U postgres -c "DROP DATABASE fakedetect; CREATE DATABASE fakedetect;"

# Option 2: Remove volume and restart
docker compose down -v  # Removes named volumes
docker compose up --build
```

---

## 🚨 Troubleshooting

### Database Connection Refused

```bash
# Check if database is running
docker compose ps db

# View database logs
docker compose logs db

# Restart database
docker compose restart db
```

### Migration Errors

```bash
# Clear old migrations and start fresh
docker compose exec backend python manage.py migrate api zero

# Create new migrations
docker compose exec backend python manage.py makemigrations api

# Apply migrations
docker compose exec backend python manage.py migrate
```

### Slow Queries

Create indexes for frequently queried fields:

```bash
docker compose exec db psql -U postgres -d fakedetect << EOF
CREATE INDEX IF NOT EXISTS idx_qr_code_hash ON qr_codes(code_hash);
CREATE INDEX IF NOT EXISTS idx_scan_records_created ON scan_records(created_at);
CREATE INDEX IF NOT EXISTS idx_products_brand_user ON products(brand_user_id);
EOF
```

### Password Reset

```bash
# Reset admin user password
docker compose exec backend python manage.py changepassword admin
```

---

## 📈 Performance Optimization

### Enable Query Logging

```yaml
# Add to docker-compose.yml db service:
command: 
  - postgres
  - -c
  - log_statement=all
  - -c
  - log_duration=on
```

### Query Optimization

```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM scan_records WHERE status = 'warning';

-- Vacuum to clean up space
VACUUM ANALYZE scan_records;
```

---

## 🔄 Data Migration from Mock to Real Database

When moving from in-memory mock data to PostgreSQL:

1. **Export existing data** (if any):
   ```bash
   # Create a backup of current state
   ```

2. **Run migrations**:
   ```bash
   docker compose exec backend python manage.py migrate
   ```

3. **Seed initial data** (optional):
   ```bash
   # Create a fixture file or data migration
   docker compose exec backend python manage.py loaddata initial_data.json
   ```

4. **Verify data**:
   ```bash
   docker compose exec db psql -U postgres -d fakedetect -c "SELECT COUNT(*) FROM products;"
   ```

---

## 📝 Django ORM vs Raw SQL

The application uses Django ORM for most operations, but you can also use raw SQL:

### Using Django ORM (Recommended)

```python
from api.models import Product

# Get products
products = Product.objects.filter(brand_user_id=user_id)

# Get scan count
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

- [ ] Docker containers are running: `docker compose ps`
- [ ] Database is healthy: `docker compose exec db pg_isready`
- [ ] Migrations applied: `docker compose exec backend python manage.py showmigrations`
- [ ] Tables created: `docker compose exec db psql -U postgres -d fakedetect -c "\dt"`
- [ ] Can login to admin: `http://localhost:8000/admin`
- [ ] API working: `curl http://localhost:8000/api/health/`

---

## 📚 Further Reading

- [Django Database Documentation](https://docs.djangoproject.com/en/4.2/ref/databases/postgresql/)
- [PostgreSQL Official Docs](https://www.postgresql.org/docs/)
- [Docker Compose Volumes](https://docs.docker.com/compose/compose-file/compose-file-v3/#volumes)

---

**Need help?** Check the logs:
```bash
docker compose logs -f backend
docker compose logs -f db
```
