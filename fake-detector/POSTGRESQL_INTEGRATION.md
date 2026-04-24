# 🗄️ PostgreSQL Database Integration Summary

## ✅ What's Been Integrated

Your FakeDetect application now includes **full PostgreSQL database integration** with production-ready models and migrations.

---

## 📦 What You Got

### 1. **PostgreSQL Service** (docker-compose.yml)
- Auto-creates `fakedetect` database
- Volume persistence (`postgres_data`)
- Health checks
- Automatic startup with backend

### 2. **8 Comprehensive Models** (api/models.py)

```
├── User (extended Django auth)
├── Brand (manufacturer profiles)
├── Product (product catalog)
├── QRCode (unique verification codes)
├── ScanRecord (individual scans)
├── Report (counterfeit reports)
├── SubscriptionPlan (tier definitions)
└── BrandSubscription (brand subscriptions)
```

### 3. **Auto-Migrations**
- Docker runs migrations automatically on startup
- Creates all tables, indexes, and relationships
- Safe to update models later

### 4. **Production Features**
- ✅ Foreign key relationships
- ✅ Database indexes for performance
- ✅ Soft deletes (is_active field)
- ✅ Timestamps (created_at, updated_at)
- ✅ Geolocation tracking
- ✅ IP address logging

---

## 🚀 Running the Application

```bash
# Extract and navigate
tar -xzf fake-detector.tar.gz
cd fake-detector

# Start everything
docker compose up --build

# Done! Access at:
# Frontend: http://localhost:5173
# Backend:  http://localhost:8000/api
# Database: localhost:5432
```

**What happens automatically:**
1. PostgreSQL container starts and creates database
2. Django runs migrations (`python manage.py migrate`)
3. Tables are created from models
4. Backend server starts
5. Frontend starts

---

## 🗂️ Database Tables

### users
```sql
id, username, email, password, role, company_name, phone, date_joined, is_active
```
- Stores all user accounts (consumer, brand, admin)

### products
```sql
id, brand_user_id, name, brand, sku, batch_number, category, 
manufacturing_date, expiry_date, image_url, price, is_active, created_at, updated_at
```
- Product catalog maintained by brands
- Indexed by SKU and brand_user_id for fast lookups

### qr_codes
```sql
id, product_id, code_hash, code_text, qr_image_data, total_scans,
first_scan_time, first_scan_ip, first_scan_location, last_scan_time, last_scan_ip,
is_active, created_at
```
- Unique QR codes for each product
- Tracks first and last scan details
- Indexed by code_hash for O(1) lookups

### scan_records
```sql
id, qr_code_id, product_id, user_id, code_scanned, status, message,
ip_address, user_agent, location, latitude, longitude, scanned_at
```
- Individual scan records with geolocation
- Status: verified, warning, invalid
- Indexed by qr_code_id and created_at for fast history queries

### reports
```sql
id, qr_code_id, scan_record_id, user_id, status, reason, additional_info,
evidence_url, admin_notes, is_reviewed, reported_at, updated_at
```
- User reports for suspicious/counterfeit products
- Status: pending, investigating, confirmed_fake, verified_genuine, closed

### subscription_plans
```sql
id, tier, name, description, price, currency, max_products, 
max_qr_codes_per_month, max_scans_per_day, has_analytics, has_api_access,
has_bulk_export, has_priority_support, created_at
```
- Subscription tier definitions
- Free, Basic, Professional, Enterprise

### brand_subscriptions
```sql
id, brand_user_id, plan_id, status, start_date, end_date, renewal_date,
qr_codes_used_this_month, scans_today, stripe_subscription_id, created_at, updated_at
```
- Brand subscription status and usage tracking

### brands
```sql
id, user_id, company_name, description, logo_url, website, email, phone,
country, is_verified, is_active, created_at, updated_at
```
- Brand/Manufacturer profiles (optional, for future expansion)

---

## 📊 Sample SQL Queries

### Get All Scans for Today
```sql
SELECT sr.id, sr.code_scanned, sr.status, p.name, sr.scanned_at
FROM scan_records sr
JOIN qr_codes q ON sr.qr_code_id = q.id
JOIN products p ON q.product_id = p.id
WHERE DATE(sr.scanned_at) = CURRENT_DATE
ORDER BY sr.scanned_at DESC;
```

### Find Products Expiring Soon
```sql
SELECT id, name, sku, expiry_date, brand
FROM products
WHERE expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
AND is_active = TRUE
ORDER BY expiry_date ASC;
```

### Get Brand's Scan Statistics
```sql
SELECT p.brand, COUNT(sr.id) as total_scans,
       SUM(CASE WHEN sr.status = 'verified' THEN 1 ELSE 0 END) as verified,
       SUM(CASE WHEN sr.status = 'warning' THEN 1 ELSE 0 END) as fakes_detected
FROM scan_records sr
JOIN qr_codes q ON sr.qr_code_id = q.id
JOIN products p ON q.product_id = p.id
GROUP BY p.brand
ORDER BY total_scans DESC;
```

### Most Scanned Products
```sql
SELECT p.id, p.name, p.sku, q.total_scans, MAX(q.last_scan_time) as last_scanned
FROM products p
JOIN qr_codes q ON p.id = q.product_id
GROUP BY p.id, p.name, p.sku, q.total_scans
ORDER BY q.total_scans DESC
LIMIT 10;
```

**➡️ See `SQL_QUERIES.md` for 100+ production queries**

---

## 🔧 Database Operations

### Create Superuser
```bash
docker compose exec backend python manage.py createsuperuser
```

### View Database Size
```bash
docker compose exec db psql -U postgres -d fakedetect \
  -c "SELECT pg_size_pretty(pg_database_size('fakedetect'));"
```

### Backup Database
```bash
docker compose exec db pg_dump -U postgres fakedetect > backup.sql
```

### Restore from Backup
```bash
docker compose exec -T db psql -U postgres -d fakedetect < backup.sql
```

### Connect to Database CLI
```bash
docker compose exec db psql -U postgres -d fakedetect
```

### View Table Structure
```bash
docker compose exec db psql -U postgres -d fakedetect -c "\d+ products"
```

### Check All Indexes
```bash
docker compose exec db psql -U postgres -d fakedetect \
  -c "SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';"
```

---

## 📈 Performance Features

### Indexed Columns (for fast queries)
- `qr_codes.code_hash` – O(1) lookup by QR code
- `products.sku` – O(1) lookup by SKU
- `products.brand_user_id` – Fast filtering by brand
- `scan_records.created_at` – Fast date range queries
- `scan_records.status` – Fast status filtering

### Relationships
- Product → Brand User (FK)
- QRCode → Product (FK)
- ScanRecord → QRCode, Product, User (FK)
- Report → QRCode, ScanRecord, User (FK)
- BrandSubscription → User, SubscriptionPlan (FK)

---

## 🔄 Data Migration Path

If you were previously using mock data:

1. **Extract new archive** with PostgreSQL integration
2. **Run migrations** (automatic in Docker)
3. **Seed initial data** (optional - create fixture files)
4. **Verify** tables are created

```bash
# Check tables
docker compose exec db psql -U postgres -d fakedetect -c "\dt"

# Count records
docker compose exec db psql -U postgres -d fakedetect -c \
  "SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM products;"
```

---

## ⚙️ Configuration

### Environment Variables (docker-compose.yml)
```yaml
DB_NAME=fakedetect           # Database name
DB_USER=postgres             # Database user
DB_PASSWORD=postgres         # Database password
DB_HOST=db                   # Container hostname
DB_PORT=5432                 # PostgreSQL port
```

### Django Settings (core/settings.py)
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'fakedetect'),
        'USER': os.environ.get('DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'postgres'),
        'HOST': os.environ.get('DB_HOST', 'db'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}
```

---

## 🚨 Troubleshooting

### Database Connection Failed
```bash
# Check if database is running
docker compose ps db

# View logs
docker compose logs db

# Restart
docker compose restart db
```

### Migration Errors
```bash
# Reset migrations
docker compose exec backend python manage.py migrate api zero
docker compose exec backend python manage.py migrate
```

### "Table does not exist" Error
```bash
# Run migrations manually
docker compose exec backend python manage.py migrate
```

### Want to Clear Database
```bash
# WARNING: Deletes all data!
docker compose down -v
docker compose up --build
```

---

## 📚 Documentation Files Included

1. **SQL_QUERIES.md** (100+ production-ready SQL queries)
   - User management
   - Product CRUD
   - QR code operations
   - Scan analytics
   - Dashboard queries
   - Maintenance queries

2. **DATABASE_SETUP.md** (detailed database guide)
   - Backup/restore procedures
   - Migration management
   - Performance optimization
   - Troubleshooting guide

3. **README.md** (updated with database info)
   - Quick start instructions
   - Project structure
   - API endpoints

4. **QUICKSTART.md** (rapid testing guide)
   - Demo account credentials
   - Test codes
   - Feature overview

---

## ✅ Verification Checklist

After starting the application:

- [ ] Docker containers running: `docker compose ps`
- [ ] Database healthy: `docker compose logs db` (no errors)
- [ ] Frontend accessible: http://localhost:5173
- [ ] Backend accessible: http://localhost:8000/api/health/
- [ ] Can login with demo credentials
- [ ] Can view products from database
- [ ] Can perform scans and see results stored
- [ ] Dashboard shows real analytics from database

---

## 🎯 What's Working Now

✅ User authentication with database
✅ Products stored in PostgreSQL
✅ QR codes generated and stored
✅ Scans tracked with geolocation
✅ Reports submitted and stored
✅ Analytics calculated from real data
✅ Subscription plans in database
✅ All data persists across restarts

---

## 🚀 Next Steps

1. **Test thoroughly** with demo accounts
2. **Review SQL_QUERIES.md** for available operations
3. **Customize** models if needed
4. **Set strong passwords** for production
5. **Schedule backups** for production
6. **Monitor database** size and performance

---

## 📞 Support Resources

- **Django Models**: https://docs.djangoproject.com/en/4.2/topics/db/models/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **DRF Serializers**: https://www.django-rest-framework.org/api-guide/serializers/
- **Docker Docs**: https://docs.docker.com/

---

**Your production-ready anti-counterfeit platform with PostgreSQL is ready! 🎉**
