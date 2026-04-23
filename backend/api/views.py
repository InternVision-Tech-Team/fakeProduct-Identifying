import uuid
import io
import base64
import random
from datetime import datetime, timedelta

import qrcode
from PIL import Image

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

# ──────────────────────────────────────────────
# In-memory mock store  (replaces DB for now)
# ──────────────────────────────────────────────
MOCK_PRODUCTS = {
    "prod_001": {
        "id": "prod_001",
        "name": "Premium Wireless Headphones",
        "brand": "SoundTech",
        "sku": "ST-WH-2024",
        "batch_number": "BT20240301",
        "manufacturing_date": "2024-03-01",
        "expiry_date": "2027-03-01",
        "description": "High-quality noise-cancelling wireless headphones.",
        "category": "Electronics",
        "image_url": "https://placehold.co/300x300?text=Headphones",
    },
    "prod_002": {
        "id": "prod_002",
        "name": "Organic Green Tea",
        "brand": "NatureBrew",
        "sku": "NB-GT-500",
        "batch_number": "BT20240415",
        "manufacturing_date": "2024-04-15",
        "expiry_date": "2025-10-15",
        "description": "100% organic green tea leaves from Assam.",
        "category": "Food & Beverage",
        "image_url": "https://placehold.co/300x300?text=Green+Tea",
    },
    "prod_003": {
        "id": "prod_003",
        "name": "Anti-Aging Face Serum",
        "brand": "GlowLab",
        "sku": "GL-FS-30ML",
        "batch_number": "BT20240520",
        "manufacturing_date": "2024-05-20",
        "expiry_date": "2026-05-20",
        "description": "Advanced retinol face serum with hyaluronic acid.",
        "category": "Cosmetics",
        "image_url": "https://placehold.co/300x300?text=Face+Serum",
    },
    "prod_004": {
        "id": "prod_004",
        "name": "Smart Fitness Band",
        "brand": "FitPulse",
        "sku": "FP-FB-PRO",
        "batch_number": "BT20240610",
        "manufacturing_date": "2024-06-10",
        "expiry_date": "2028-06-10",
        "description": "Track heart rate, steps, sleep and more.",
        "category": "Electronics",
        "image_url": "https://placehold.co/300x300?text=Fitness+Band",
    },
}

# QR code records: { code_hash -> { product_id, total_scans, first_scan_time, ... } }
QR_RECORDS = {
    "VERIFY-prod_001-ALPHA123": {"product_id": "prod_001", "total_scans": 0, "first_scan_time": None, "scan_log": []},
    "VERIFY-prod_001-BETA456":  {"product_id": "prod_001", "total_scans": 1, "first_scan_time": "2024-11-10T08:30:00Z", "scan_log": [{"time": "2024-11-10T08:30:00Z", "ip": "192.168.1.1"}]},
    "VERIFY-prod_002-GAMMA789": {"product_id": "prod_002", "total_scans": 0, "first_scan_time": None, "scan_log": []},
    "VERIFY-prod_003-DELTA000": {"product_id": "prod_003", "total_scans": 0, "first_scan_time": None, "scan_log": []},
    "VERIFY-prod_004-OMEGA999": {"product_id": "prod_004", "total_scans": 2, "first_scan_time": "2024-12-01T14:22:00Z", "scan_log": [{"time": "2024-12-01T14:22:00Z", "ip": "10.0.0.5"}, {"time": "2024-12-05T09:11:00Z", "ip": "172.16.0.3"}]},
}

MOCK_SCAN_HISTORY = [
    {"id": 1, "product": "Premium Wireless Headphones", "brand": "SoundTech", "status": "VERIFIED",  "scanned_at": "2025-01-15T10:22:00Z", "code": "VERIFY-prod_001-ALPHA123"},
    {"id": 2, "product": "Organic Green Tea",           "brand": "NatureBrew", "status": "WARNING",   "scanned_at": "2025-01-14T16:05:00Z", "code": "VERIFY-prod_001-BETA456"},
    {"id": 3, "product": "Anti-Aging Face Serum",       "brand": "GlowLab",    "status": "VERIFIED",  "scanned_at": "2025-01-13T09:55:00Z", "code": "VERIFY-prod_003-DELTA000"},
    {"id": 4, "product": "Unknown Product",             "brand": "N/A",        "status": "INVALID",   "scanned_at": "2025-01-12T18:30:00Z", "code": "FAKE-CODE-XYZ"},
]

MOCK_USERS = {
    "brand@demo.com": {"password": "demo1234", "role": "brand",    "name": "SoundTech Inc."},
    "admin@demo.com": {"password": "admin123", "role": "admin",    "name": "Admin User"},
    "user@demo.com":  {"password": "user1234", "role": "consumer", "name": "John Consumer"},
}

# ──────────────────────────────────────────────
# Helper
# ──────────────────────────────────────────────
def _qr_as_base64(data: str) -> str:
    qr = qrcode.QRCode(version=1, box_size=8, border=2)
    qr.add_data(data)
    qr.make(fit=True)
    img: Image.Image = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()

# ──────────────────────────────────────────────
# Views
# ──────────────────────────────────────────────

@api_view(["GET"])
def health_check(request):
    return Response({"status": "ok", "message": "FakeDetect API is running 🟢", "version": "1.0.0"})


# ── Auth ──────────────────────────────────────

@api_view(["POST"])
def login_view(request):
    email    = request.data.get("email", "").lower()
    password = request.data.get("password", "")
    user = MOCK_USERS.get(email)
    if not user or user["password"] != password:
        return Response({"error": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)
    return Response({
        "access": f"mock_jwt_access_token_for_{email}",
        "refresh": "mock_jwt_refresh_token",
        "user": {"email": email, "name": user["name"], "role": user["role"]},
    })


@api_view(["POST"])
def register_view(request):
    email = request.data.get("email", "")
    name  = request.data.get("name", "")
    if not email or not name:
        return Response({"error": "Email and name are required."}, status=status.HTTP_400_BAD_REQUEST)
    return Response({"message": "Registration successful! Check your email to verify your account.", "email": email})


# ── Products ──────────────────────────────────

@api_view(["GET", "POST"])
def products_list(request):
    if request.method == "GET":
        return Response({"count": len(MOCK_PRODUCTS), "results": list(MOCK_PRODUCTS.values())})
    # POST – add a mock product
    pid   = f"prod_{uuid.uuid4().hex[:6]}"
    prod  = {
        "id": pid,
        "name":               request.data.get("name", "New Product"),
        "brand":              request.data.get("brand", "Demo Brand"),
        "sku":                request.data.get("sku", f"SKU-{pid.upper()}"),
        "batch_number":       request.data.get("batch_number", "BT000"),
        "manufacturing_date": request.data.get("manufacturing_date", "2024-01-01"),
        "expiry_date":        request.data.get("expiry_date", "2026-01-01"),
        "description":        request.data.get("description", ""),
        "category":           request.data.get("category", "General"),
        "image_url":          "https://placehold.co/300x300?text=Product",
    }
    MOCK_PRODUCTS[pid] = prod
    return Response(prod, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "DELETE"])
def product_detail(request, product_id):
    prod = MOCK_PRODUCTS.get(product_id)
    if not prod:
        return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        return Response(prod)
    if request.method == "PUT":
        prod.update({k: v for k, v in request.data.items() if k in prod})
        return Response(prod)
    # DELETE
    del MOCK_PRODUCTS[product_id]
    return Response({"message": "Product deleted."}, status=status.HTTP_204_NO_CONTENT)


# ── QR Codes ──────────────────────────────────

@api_view(["POST"])
def generate_qr(request):
    """Generate a QR code for a given product_id and return base64 PNG."""
    product_id = request.data.get("product_id")
    count      = int(request.data.get("count", 1))

    if not product_id or product_id not in MOCK_PRODUCTS:
        return Response({"error": "Valid product_id is required."}, status=status.HTTP_400_BAD_REQUEST)

    generated = []
    for _ in range(min(count, 10)):          # cap at 10 in demo
        code_hash = f"VERIFY-{product_id}-{uuid.uuid4().hex[:8].upper()}"
        QR_RECORDS[code_hash] = {
            "product_id":    product_id,
            "total_scans":   0,
            "first_scan_time": None,
            "scan_log":      [],
        }
        generated.append({
            "code":     code_hash,
            "qr_image": _qr_as_base64(code_hash),
        })

    return Response({"product_id": product_id, "generated_count": len(generated), "qr_codes": generated})


# ── Scan ──────────────────────────────────────

@api_view(["POST"])
def scan_code(request):
    """Core anti-counterfeit scan endpoint."""
    code = request.data.get("code", "").strip()
    ip   = request.META.get("HTTP_X_FORWARDED_FOR", request.META.get("REMOTE_ADDR", "unknown"))

    if not code:
        return Response({"error": "No QR/barcode value provided."}, status=status.HTTP_400_BAD_REQUEST)

    record = QR_RECORDS.get(code)

    if record is None:
        return Response({
            "status":  "INVALID",
            "message": "This code was not found in our database. This product may be counterfeit.",
            "code":    code,
        }, status=status.HTTP_200_OK)

    product = MOCK_PRODUCTS.get(record["product_id"], {})

    if record["total_scans"] == 0:
        # First ever scan → VERIFIED
        now = datetime.utcnow().isoformat() + "Z"
        record["total_scans"]     = 1
        record["first_scan_time"] = now
        record["scan_log"].append({"time": now, "ip": ip})
        return Response({
            "status":  "VERIFIED",
            "message": "✅ This product is GENUINE and has not been scanned before.",
            "product": product,
            "scan_info": {
                "first_scan":  now,
                "total_scans": 1,
            },
        })
    else:
        # Already scanned → WARNING
        record["total_scans"] += 1
        record["scan_log"].append({"time": datetime.utcnow().isoformat() + "Z", "ip": ip})
        return Response({
            "status":  "WARNING",
            "message": f"⚠️ WARNING: This code was already scanned on {record['first_scan_time']}. This product may be FAKE.",
            "product": product,
            "scan_info": {
                "first_scan":  record["first_scan_time"],
                "total_scans": record["total_scans"],
            },
        })


# ── Scan History ──────────────────────────────

@api_view(["GET"])
def scan_history(request):
    return Response({"count": len(MOCK_SCAN_HISTORY), "results": MOCK_SCAN_HISTORY})


# ── Dashboard Analytics ───────────────────────

@api_view(["GET"])
def dashboard_stats(request):
    total_scans    = sum(r["total_scans"] for r in QR_RECORDS.values())
    fake_alerts    = sum(1 for r in QR_RECORDS.values() if r["total_scans"] > 1)
    total_products = len(MOCK_PRODUCTS)
    total_qr_codes = len(QR_RECORDS)

    # Mini time-series (last 7 days, mock)
    today = datetime.utcnow()
    weekly = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        weekly.append({
            "date":   day.strftime("%b %d"),
            "scans":  random.randint(10, 120),
            "alerts": random.randint(0, 8),
        })

    return Response({
        "overview": {
            "total_products":  total_products,
            "total_qr_codes":  total_qr_codes,
            "total_scans":     total_scans,
            "fake_alerts":     fake_alerts,
            "verified_scans":  max(0, total_scans - fake_alerts),
        },
        "weekly_data": weekly,
        "recent_alerts": [
            {"product": "Smart Fitness Band", "code": "VERIFY-prod_004-OMEGA999", "time": "2024-12-05T09:11:00Z", "location": "Mumbai, IN"},
            {"product": "Premium Wireless Headphones", "code": "VERIFY-prod_001-BETA456", "time": "2024-11-10T08:30:00Z", "location": "Delhi, IN"},
        ],
        "category_breakdown": [
            {"category": "Electronics",      "count": 2},
            {"category": "Food & Beverage",  "count": 1},
            {"category": "Cosmetics",        "count": 1},
        ],
    })


# ── Demo QR Codes (for testing the scanner) ───

@api_view(["GET"])
def demo_codes(request):
    """Returns pre-made QR images to help users test the scanner."""
    demos = []
    for code, record in list(QR_RECORDS.items())[:5]:
        prod = MOCK_PRODUCTS.get(record["product_id"], {})
        demos.append({
            "code":        code,
            "product":     prod.get("name", "Unknown"),
            "scans_so_far": record["total_scans"],
            "expected_result": "WARNING" if record["total_scans"] > 0 else "VERIFIED",
            "qr_image":    _qr_as_base64(code),
        })
    return Response(demos)
