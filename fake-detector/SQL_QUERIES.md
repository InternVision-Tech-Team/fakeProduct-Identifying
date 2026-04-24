# FakeDetect - PostgreSQL Queries & Schema

This document contains all SQL queries needed for the FakeDetect anti-counterfeit platform.

## 📊 Database Schema Overview

The database consists of 8 main tables:

1. **users** - User accounts (extended Django auth)
2. **brands** - Brand/Manufacturer profiles
3. **products** - Product catalog
4. **qr_codes** - Unique QR codes for products
5. **scan_records** - Individual scan records
6. **reports** - User reports for suspicious products
7. **subscription_plans** - Available subscription tiers
8. **brand_subscriptions** - Brand subscription status

---

## 🔑 User Management Queries

### Create a Brand User
```sql
INSERT INTO users (username, email, password, first_name, last_name, role, company_name, phone, is_staff, is_superuser, date_joined, last_login, is_active)
VALUES ('brand_acme', 'brand@acme.com', 'hashed_password_here', 'Acme', 'Inc', 'brand', 'Acme Corporation', '+1234567890', FALSE, FALSE, NOW(), NULL, TRUE);
```

### Get All Users by Role
```sql
SELECT id, username, email, role, company_name, date_joined 
FROM users 
WHERE role = 'brand'
ORDER BY date_joined DESC;
```

### Get Specific User Profile
```sql
SELECT * FROM users 
WHERE email = 'brand@acme.com';
```

### Update User Profile
```sql
UPDATE users 
SET company_name = 'Updated Company Name', phone = '+9876543210'
WHERE email = 'brand@acme.com';
```

### Get Total Users Count by Role
```sql
SELECT role, COUNT(*) as count
FROM users
GROUP BY role
ORDER BY count DESC;
```

---

## 🏢 Brand Management Queries

### Register a New Brand
```sql
INSERT INTO brands (id, user_id, company_name, description, email, phone, country, is_verified, is_active, created_at, updated_at)
VALUES (uuid_generate_v4(), (SELECT id FROM users WHERE email = 'brand@acme.com'), 'Acme Corporation', 'Leading product manufacturer', 'contact@acme.com', '+1-800-ACME', 'USA', FALSE, TRUE, NOW(), NOW());
```

### Get All Active Brands
```sql
SELECT b.id, b.company_name, u.email, b.country, b.is_verified, b.created_at
FROM brands b
JOIN users u ON b.user_id = u.id
WHERE b.is_active = TRUE
ORDER BY b.created_at DESC;
```

### Get Brand Profile with Product Count
```sql
SELECT b.id, b.company_name, b.email, COUNT(p.id) as product_count, COUNT(q.id) as qr_code_count
FROM brands b
LEFT JOIN products p ON b.user_id = p.brand_user_id
LEFT JOIN qr_codes q ON p.id = q.product_id
WHERE b.user_id = (SELECT id FROM users WHERE email = 'brand@acme.com')
GROUP BY b.id, b.company_name, b.email;
```

### Suspend a Brand (Set Inactive)
```sql
UPDATE brands 
SET is_active = FALSE, updated_at = NOW()
WHERE user_id = (SELECT id FROM users WHERE email = 'suspicious@brand.com');
```

### Get Verified Brands
```sql
SELECT company_name, email, country, created_at
FROM brands
WHERE is_verified = TRUE AND is_active = TRUE
ORDER BY created_at DESC;
```

---

## 📦 Product Management Queries

### Add a New Product
```sql
INSERT INTO products (id, brand_user_id, name, brand, sku, batch_number, category, description, manufacturing_date, expiry_date, image_url, price, is_active, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    (SELECT id FROM users WHERE email = 'brand@acme.com'),
    'Premium Wireless Headphones',
    'Acme Electronics',
    'ACME-WH-2024-001',
    'BT-20240315-001',
    'electronics',
    'High-quality noise-cancelling wireless headphones with 30-hour battery life',
    '2024-03-15',
    '2027-03-15',
    'https://example.com/headphones.jpg',
    199.99,
    TRUE,
    NOW(),
    NOW()
);
```

### Get All Products for a Brand
```sql
SELECT id, name, sku, category, batch_number, manufacturing_date, expiry_date, is_active
FROM products
WHERE brand_user_id = (SELECT id FROM users WHERE email = 'brand@acme.com')
ORDER BY created_at DESC;
```

### Get Product with QR Code Count
```sql
SELECT p.id, p.name, p.sku, p.category, COUNT(q.id) as qr_code_count, COUNT(DISTINCT sr.id) as total_scans
FROM products p
LEFT JOIN qr_codes q ON p.id = q.product_id
LEFT JOIN scan_records sr ON q.id = sr.qr_code_id
WHERE p.id = 'product-uuid-here'
GROUP BY p.id, p.name, p.sku, p.category;
```

### Find Products Expiring Soon (within 30 days)
```sql
SELECT id, name, sku, expiry_date, brand
FROM products
WHERE expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
AND is_active = TRUE
ORDER BY expiry_date ASC;
```

### Get Products by Category
```sql
SELECT id, name, sku, category, brand_user_id, created_at
FROM products
WHERE category = 'electronics'
AND is_active = TRUE
ORDER BY created_at DESC;
```

### Update Product Details
```sql
UPDATE products
SET name = 'Updated Product Name', description = 'Updated description', updated_at = NOW()
WHERE id = 'product-uuid-here';
```

### Delete Product (Soft Delete)
```sql
UPDATE products
SET is_active = FALSE, updated_at = NOW()
WHERE id = 'product-uuid-here';
```

### Count Products by Category
```sql
SELECT category, COUNT(*) as count
FROM products
WHERE is_active = TRUE
GROUP BY category
ORDER BY count DESC;
```

---

## 🔐 QR Code Management Queries

### Generate QR Code Record
```sql
INSERT INTO qr_codes (id, product_id, code_hash, code_text, qr_image_data, total_scans, is_active, created_at)
VALUES (
    uuid_generate_v4(),
    'product-uuid-here',
    'VERIFY-prod-abc123xyz789',
    'VERIFY-prod-abc123xyz789',
    'data:image/png;base64,...base64_encoded_png...',
    0,
    TRUE,
    NOW()
);
```

### Get All QR Codes for a Product
```sql
SELECT id, code_hash, code_text, total_scans, first_scan_time, last_scan_time, created_at
FROM qr_codes
WHERE product_id = 'product-uuid-here'
ORDER BY created_at DESC;
```

### Get QR Codes with Scan Details
```sql
SELECT q.id, q.code_hash, q.code_text, q.total_scans, q.first_scan_time, q.first_scan_ip, p.name as product_name
FROM qr_codes q
JOIN products p ON q.product_id = p.id
WHERE q.product_id = 'product-uuid-here'
ORDER BY q.created_at DESC;
```

### Find QR Code by Code Hash (for scanning)
```sql
SELECT q.id, q.code_hash, q.code_text, q.total_scans, q.first_scan_time, q.first_scan_ip, q.first_scan_location,
       p.id as product_id, p.name, p.brand, p.sku, p.batch_number, p.manufacturing_date, p.expiry_date, p.category, p.description
FROM qr_codes q
JOIN products p ON q.product_id = p.id
WHERE q.code_hash = 'VERIFY-prod-abc123xyz789'
LIMIT 1;
```

### Update QR Code After Scan (First Scan)
```sql
UPDATE qr_codes
SET total_scans = total_scans + 1,
    first_scan_time = CASE WHEN total_scans = 0 THEN NOW() ELSE first_scan_time END,
    first_scan_ip = CASE WHEN total_scans = 0 THEN '192.168.1.1' ELSE first_scan_ip END,
    first_scan_location = CASE WHEN total_scans = 0 THEN 'Mumbai, India' ELSE first_scan_location END,
    last_scan_time = NOW(),
    last_scan_ip = '192.168.1.1'
WHERE code_hash = 'VERIFY-prod-abc123xyz789';
```

### Get Most Scanned QR Codes
```sql
SELECT q.code_text, p.name, q.total_scans, q.first_scan_time, COUNT(sr.id) as warning_count
FROM qr_codes q
JOIN products p ON q.product_id = p.id
LEFT JOIN scan_records sr ON q.id = sr.qr_code_id AND sr.status = 'warning'
GROUP BY q.id, q.code_text, p.name, q.total_scans, q.first_scan_time
ORDER BY q.total_scans DESC
LIMIT 10;
```

### Get Inactive/Never Scanned Codes
```sql
SELECT q.id, q.code_text, p.name, q.created_at
FROM qr_codes q
JOIN products p ON q.product_id = p.id
WHERE q.total_scans = 0
AND q.created_at < NOW() - INTERVAL '30 days'
ORDER BY q.created_at ASC;
```

---

## 📱 Scan Records Queries

### Record a Scan (Insert)
```sql
INSERT INTO scan_records (id, qr_code_id, product_id, user_id, code_scanned, status, message, ip_address, user_agent, location, latitude, longitude, scanned_at)
VALUES (
    uuid_generate_v4(),
    'qrcode-uuid-here',
    'product-uuid-here',
    NULL,  -- Can be NULL for anonymous scans
    'VERIFY-prod-abc123xyz789',
    'verified',
    'Product verified - first scan',
    '203.0.113.42',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
    'Mumbai, Maharashtra, India',
    19.0760,
    72.8777,
    NOW()
);
```

### Get All Scans for a QR Code
```sql
SELECT id, status, ip_address, location, latitude, longitude, scanned_at
FROM scan_records
WHERE qr_code_id = 'qrcode-uuid-here'
ORDER BY scanned_at DESC;
```

### Get Scan Results Count by Status
```sql
SELECT status, COUNT(*) as count
FROM scan_records
WHERE scanned_at >= NOW() - INTERVAL '7 days'
GROUP BY status
ORDER BY count DESC;
```

### Get User's Scan History
```sql
SELECT sr.id, sr.code_scanned, sr.status, p.name as product_name, p.brand, sr.scanned_at
FROM scan_records sr
LEFT JOIN products p ON sr.product_id = p.id
WHERE sr.user_id = 'user-uuid-here'
ORDER BY sr.scanned_at DESC;
```

### Get Verified Scans (First Scan = Genuine)
```sql
SELECT sr.id, sr.code_scanned, p.name, p.brand, sr.scanned_at, sr.location
FROM scan_records sr
JOIN qr_codes q ON sr.qr_code_id = q.id
JOIN products p ON q.product_id = p.id
WHERE sr.status = 'verified'
AND sr.scanned_at >= NOW() - INTERVAL '24 hours'
ORDER BY sr.scanned_at DESC;
```

### Get Warning Scans (Duplicate = Potential Fake)
```sql
SELECT sr.id, sr.code_scanned, p.name, p.brand, sr.scanned_at, sr.location, q.first_scan_time
FROM scan_records sr
JOIN qr_codes q ON sr.qr_code_id = q.id
JOIN products p ON q.product_id = p.id
WHERE sr.status = 'warning'
ORDER BY sr.scanned_at DESC;
```

### Get Geographic Distribution of Scans
```sql
SELECT location, COUNT(*) as scan_count, AVG(latitude) as avg_lat, AVG(longitude) as avg_lon
FROM scan_records
WHERE location IS NOT NULL
AND scanned_at >= NOW() - INTERVAL '30 days'
GROUP BY location
ORDER BY scan_count DESC
LIMIT 10;
```

### Get Daily Scan Statistics
```sql
SELECT DATE(scanned_at) as scan_date, 
       COUNT(*) as total_scans,
       SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified,
       SUM(CASE WHEN status = 'warning' THEN 1 ELSE 0 END) as warnings,
       SUM(CASE WHEN status = 'invalid' THEN 1 ELSE 0 END) as invalid
FROM scan_records
WHERE scanned_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(scanned_at)
ORDER BY scan_date DESC;
```

### Get Brand's Scan Analytics
```sql
SELECT p.brand, COUNT(sr.id) as total_scans,
       SUM(CASE WHEN sr.status = 'verified' THEN 1 ELSE 0 END) as verified_scans,
       SUM(CASE WHEN sr.status = 'warning' THEN 1 ELSE 0 END) as fake_alerts,
       COUNT(DISTINCT p.id) as product_count
FROM scan_records sr
JOIN qr_codes q ON sr.qr_code_id = q.id
JOIN products p ON q.product_id = p.id
WHERE p.brand_user_id = (SELECT id FROM users WHERE email = 'brand@acme.com')
GROUP BY p.brand;
```

---

## ⚠️ Report Queries

### Submit a Report for Suspicious Product
```sql
INSERT INTO reports (id, qr_code_id, scan_record_id, user_id, status, reason, additional_info, evidence_url, reported_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'qrcode-uuid-here',
    'scanrecord-uuid-here',
    'user-uuid-here',
    'pending',
    'Product appears to be counterfeit - packaging quality is poor',
    'Purchased from unauthorized seller on date XYZ',
    'https://example.com/photos/evidence.jpg',
    NOW(),
    NOW()
);
```

### Get Pending Reports
```sql
SELECT r.id, r.reason, r.additional_info, p.name as product_name, r.reported_at
FROM reports r
LEFT JOIN qr_codes q ON r.qr_code_id = q.id
LEFT JOIN products p ON q.product_id = p.id
WHERE r.status = 'pending'
ORDER BY r.reported_at DESC;
```

### Get Reports for a Product
```sql
SELECT r.id, r.status, r.reason, r.reported_at, COUNT(*) OVER (PARTITION BY q.product_id) as total_reports
FROM reports r
JOIN qr_codes q ON r.qr_code_id = q.id
WHERE q.product_id = 'product-uuid-here'
ORDER BY r.reported_at DESC;
```

### Update Report Status
```sql
UPDATE reports
SET status = 'confirmed_fake', admin_notes = 'Verified counterfeit through supply chain audit', updated_at = NOW()
WHERE id = 'report-uuid-here';
```

### Get Confirmed Fake Products
```sql
SELECT DISTINCT p.id, p.name, p.brand, COUNT(r.id) as report_count, MAX(r.updated_at) as last_report_date
FROM reports r
JOIN qr_codes q ON r.qr_code_id = q.id
JOIN products p ON q.product_id = p.id
WHERE r.status = 'confirmed_fake'
GROUP BY p.id, p.name, p.brand
ORDER BY report_count DESC;
```

---

## 💳 Subscription Queries

### Get All Subscription Plans
```sql
SELECT id, tier, name, price, max_products, max_qr_codes_per_month, has_analytics, has_api_access, has_priority_support
FROM subscription_plans
ORDER BY price ASC;
```

### Get Active Brand Subscription
```sql
SELECT bs.id, bs.status, sp.name as plan_name, sp.price, bs.start_date, bs.end_date, bs.renewal_date,
       bs.qr_codes_used_this_month, sp.max_qr_codes_per_month
FROM brand_subscriptions bs
JOIN subscription_plans sp ON bs.plan_id = sp.id
WHERE bs.brand_user_id = (SELECT id FROM users WHERE email = 'brand@acme.com')
AND bs.status = 'active';
```

### Update QR Code Usage
```sql
UPDATE brand_subscriptions
SET qr_codes_used_this_month = qr_codes_used_this_month + 5
WHERE brand_user_id = 'user-uuid-here'
AND status = 'active'
AND EXTRACT(MONTH FROM start_date) = EXTRACT(MONTH FROM NOW());
```

### Reset Monthly Usage (Runs once a month)
```sql
UPDATE brand_subscriptions
SET qr_codes_used_this_month = 0, scans_today = 0, last_reset_date = CURRENT_DATE
WHERE DATE_TRUNC('day', CURRENT_DATE - INTERVAL '1 month') >= last_reset_date;
```

### Get Expiring Subscriptions (within 7 days)
```sql
SELECT u.email, bs.renewal_date, sp.name as plan_name
FROM brand_subscriptions bs
JOIN users u ON bs.brand_user_id = u.id
JOIN subscription_plans sp ON bs.plan_id = sp.id
WHERE bs.renewal_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
AND bs.status = 'active'
ORDER BY bs.renewal_date ASC;
```

---

## 📊 Dashboard Analytics Queries

### Overall Platform Statistics
```sql
SELECT 
    (SELECT COUNT(*) FROM users WHERE role = 'brand') as total_brands,
    (SELECT COUNT(*) FROM products WHERE is_active = TRUE) as active_products,
    (SELECT COUNT(*) FROM qr_codes) as total_qr_codes,
    (SELECT COUNT(*) FROM scan_records) as total_scans,
    (SELECT COUNT(*) FROM scan_records WHERE status = 'warning') as fake_alerts,
    (SELECT COUNT(*) FROM reports WHERE status = 'confirmed_fake') as confirmed_fakes;
```

### Brand Dashboard Summary
```sql
SELECT 
    COUNT(DISTINCT p.id) as product_count,
    COUNT(DISTINCT q.id) as qr_code_count,
    COUNT(sr.id) as total_scans,
    SUM(CASE WHEN sr.status = 'warning' THEN 1 ELSE 0 END) as fake_alerts,
    ROUND(100.0 * SUM(CASE WHEN sr.status = 'verified' THEN 1 ELSE 0 END) / NULLIF(COUNT(sr.id), 0), 2) as verification_rate
FROM products p
LEFT JOIN qr_codes q ON p.id = q.product_id
LEFT JOIN scan_records sr ON q.id = sr.qr_code_id
WHERE p.brand_user_id = 'user-uuid-here';
```

### Top Products by Scans
```sql
SELECT p.id, p.name, p.sku, COUNT(sr.id) as scan_count,
       SUM(CASE WHEN sr.status = 'verified' THEN 1 ELSE 0 END) as verified,
       SUM(CASE WHEN sr.status = 'warning' THEN 1 ELSE 0 END) as warnings
FROM products p
LEFT JOIN qr_codes q ON p.id = q.product_id
LEFT JOIN scan_records sr ON q.id = sr.qr_code_id
WHERE p.brand_user_id = 'user-uuid-here'
GROUP BY p.id, p.name, p.sku
ORDER BY scan_count DESC
LIMIT 10;
```

### Weekly Scan Trend
```sql
SELECT DATE_TRUNC('week', scanned_at)::DATE as week_start, 
       COUNT(*) as total_scans,
       SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END) as verified,
       SUM(CASE WHEN status = 'warning' THEN 1 ELSE 0 END) as warnings,
       SUM(CASE WHEN status = 'invalid' THEN 1 ELSE 0 END) as invalid
FROM scan_records
WHERE scanned_at >= NOW() - INTERVAL '12 weeks'
GROUP BY DATE_TRUNC('week', scanned_at)
ORDER BY week_start DESC;
```

---

## 🔧 Index Queries (Performance Optimization)

### Check Existing Indexes
```sql
SELECT indexname, tablename, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### Create Additional Indexes if Needed
```sql
-- Fast QR code lookup by hash
CREATE INDEX IF NOT EXISTS idx_qr_code_hash ON qr_codes(code_hash);

-- Fast scan lookups by date range
CREATE INDEX IF NOT EXISTS idx_scan_records_created ON scan_records(created_at);

-- Fast brand lookups
CREATE INDEX IF NOT EXISTS idx_products_brand_user ON products(brand_user_id);

-- Fast status queries
CREATE INDEX IF NOT EXISTS idx_scan_status_created ON scan_records(status, created_at);
```

---

## 🗑️ Maintenance Queries

### Delete Old Scan Records (Keep 1 year)
```sql
DELETE FROM scan_records
WHERE scanned_at < NOW() - INTERVAL '1 year';
```

### Archive Old Products (Soft delete)
```sql
UPDATE products
SET is_active = FALSE
WHERE expiry_date < CURRENT_DATE
AND is_active = TRUE;
```

### Get Database Size
```sql
SELECT pg_size_pretty(pg_database_size(current_database())) as database_size;
```

### Get Table Sizes
```sql
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 📝 Notes

- Replace `'user-uuid-here'`, `'product-uuid-here'`, etc. with actual UUIDs
- All timestamps use `NOW()` for current time in UTC
- User passwords must be hashed using Django's `make_password()`
- The application handles most queries through Django ORM, these are for direct database access
- Always use parameterized queries/prepared statements in application code to prevent SQL injection
