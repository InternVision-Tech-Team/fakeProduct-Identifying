import uuid
import io
import base64
from datetime import datetime, timedelta
from decimal import Decimal

import qrcode
from PIL import Image

from django.contrib.auth import authenticate
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, Product, QRCode, ScanRecord, Report
from .serializers import (
    UserSerializer, ProductSerializer, QRCodeSerializer,
    ScanRecordSerializer, ReportSerializer
)

# ──────────────────────────────────────────────
# Helper Functions
# ──────────────────────────────────────────────

def _qr_as_base64(data: str) -> str:
    """Generate QR code and return as base64 data URI"""
    qr = qrcode.QRCode(version=1, box_size=8, border=2)
    qr.add_data(data)
    qr.make(fit=True)
    img: Image.Image = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def _get_client_ip(request):
    """Extract client IP from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0]
    return request.META.get('REMOTE_ADDR', 'unknown')


# ──────────────────────────────────────────────
# API Views
# ──────────────────────────────────────────────

@api_view(["GET"])
def health_check(request):
    return Response({
        "status": "ok",
        "message": "FakeDetect API is running 🟢",
        "version": "2.0.0",
        "database": "PostgreSQL"
    })


# ── Authentication ────────────────────────────

@api_view(["POST"])
def register_view(request):
    """Register a new user"""
    email = request.data.get("email", "").lower()
    password = request.data.get("password", "")
    name = request.data.get("name", "")
    role = request.data.get("role", "consumer")
    
    if not email or not password or not name:
        return Response(
            {"error": "Email, password, and name are required."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if User.objects.filter(email=email).exists():
        return Response(
            {"error": "User with this email already exists."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create user
    user = User.objects.create_user(
        username=email,  # Use email as username
        email=email,
        password=password,
        first_name=name,
        role=role,
        company_name=name if role == 'brand' else None
    )
    
    return Response({
        "message": "Registration successful! You can now log in.",
        "email": email,
        "role": role
    }, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def login_view(request):
    """Login and return JWT tokens"""
    email = request.data.get("email", "").lower()
    password = request.data.get("password", "")
    
    if not email or not password:
        return Response(
            {"error": "Email and password are required."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Authenticate
    user = authenticate(username=email, password=password)
    
    if not user:
        return Response(
            {"error": "Invalid email or password."},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    
    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.first_name or user.username,
            "role": user.role
        }
    })


# ── Products ──────────────────────────────────

@api_view(["GET", "POST"])
def products_list(request):
    """List or create products"""
    
    if request.method == "GET":
        # Get products for the current user (if authenticated) or all
        products = Product.objects.filter(is_active=True).select_related('brand_user')
        
        serializer = ProductSerializer(products, many=True)
        return Response({
            "count": products.count(),
            "results": serializer.data
        })
    
    # POST - Create new product
    # For demo, we'll create products without authentication
    # In production, you'd check request.user
    
    # Get first brand user or create one
    brand_user = User.objects.filter(role='brand').first()
    if not brand_user:
        brand_user = User.objects.create_user(
            username='demo_brand',
            email='brand@demo.com',
            password='demo1234',
            role='brand',
            first_name='Demo Brand'
        )
    
    data = request.data.copy()
    data['brand_user'] = brand_user.id
    
    # Set default image if not provided
    if not data.get('image_url'):
        data['image_url'] = f"https://placehold.co/300x300?text={data.get('name', 'Product')}"
    
    serializer = ProductSerializer(data=data)
    if serializer.is_valid():
        serializer.save(brand_user=brand_user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "DELETE"])
def product_detail(request, product_id):
    """Get, update, or delete a product"""
    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return Response(
            {"error": "Product not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == "GET":
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    
    elif request.method == "PUT":
        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    else:  # DELETE
        product.is_active = False  # Soft delete
        product.save()
        return Response(
            {"message": "Product deleted."},
            status=status.HTTP_204_NO_CONTENT
        )


# ── QR Codes ──────────────────────────────────

@api_view(["POST"])
def generate_qr(request):
    """Generate QR codes for a product"""
    product_id = request.data.get("product_id")
    count = int(request.data.get("count", 1))
    
    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return Response(
            {"error": "Valid product_id is required."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    generated = []
    for _ in range(min(count, 100)):  # Cap at 100
        # Generate unique code
        code_hash = f"VERIFY-{product.id}-{uuid.uuid4().hex[:8].upper()}"
        qr_image = _qr_as_base64(code_hash)
        
        # Create QR code in database
        qr_code = QRCode.objects.create(
            product=product,
            code_hash=code_hash,
            qr_image_data=qr_image
        )
        
        generated.append({
            "id": str(qr_code.id),
            "code": code_hash,
            "qr_image": qr_image
        })
    
    return Response({
        "product_id": str(product.id),
        "product_name": product.name,
        "generated_count": len(generated),
        "qr_codes": generated
    })


# ── Scan ──────────────────────────────────────

@api_view(["POST"])
def scan_code(request):
    """Core anti-counterfeit scan endpoint"""
    code = request.data.get("code", "").strip()
    ip = _get_client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    
    if not code:
        return Response(
            {"error": "No QR/barcode value provided."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Try to find QR code
    try:
        qr_code = QRCode.objects.select_related('product').get(
            code_hash=code,
            is_active=True
        )
    except QRCode.DoesNotExist:
        # Invalid code - not in database
        ScanRecord.objects.create(
            code_scanned=code,
            status='INVALID',
            ip_address=ip,
            user_agent=user_agent
        )
        
        return Response({
            "status": "INVALID",
            "message": "This code was not found in our database. This product may be counterfeit.",
            "code": code
        })
    
    # Check scan count
    if qr_code.total_scans == 0:
        # First scan - VERIFIED
        qr_code.total_scans = 1
        qr_code.first_scan_time = timezone.now()
        qr_code.last_scan_time = timezone.now()
        qr_code.first_scan_ip = ip
        qr_code.save()
        
        # Create scan record
        scan = ScanRecord.objects.create(
            qr_code=qr_code,
            code_scanned=code,
            status='VERIFIED',
            ip_address=ip,
            user_agent=user_agent
        )
        
        product = qr_code.product
        product_data = ProductSerializer(product).data
        
        return Response({
            "status": "VERIFIED",
            "message": "✅ This product is GENUINE and has not been scanned before.",
            "product": product_data,
            "scan_info": {
                "first_scan": qr_code.first_scan_time.isoformat(),
                "total_scans": qr_code.total_scans
            }
        })
    
    else:
        # Already scanned - WARNING
        qr_code.total_scans += 1
        qr_code.last_scan_time = timezone.now()
        qr_code.save()
        
        # Create scan record
        scan = ScanRecord.objects.create(
            qr_code=qr_code,
            code_scanned=code,
            status='WARNING',
            ip_address=ip,
            user_agent=user_agent
        )
        
        product = qr_code.product
        product_data = ProductSerializer(product).data
        
        return Response({
            "status": "WARNING",
            "message": f"⚠️ WARNING: This code was already scanned on {qr_code.first_scan_time.strftime('%Y-%m-%d %H:%M')}. This product may be FAKE.",
            "product": product_data,
            "scan_info": {
                "first_scan": qr_code.first_scan_time.isoformat(),
                "total_scans": qr_code.total_scans
            }
        })


# ── Scan History ──────────────────────────────

@api_view(["GET"])
def scan_history(request):
    """Get scan history"""
    scans = ScanRecord.objects.select_related(
        'qr_code__product'
    ).order_by('-scanned_at')[:100]
    
    results = []
    for scan in scans:
        results.append({
            "id": str(scan.id),
            "product": scan.qr_code.product.name if scan.qr_code else "Unknown",
            "brand": scan.qr_code.product.brand if scan.qr_code else "N/A",
            "status": scan.status,
            "scanned_at": scan.scanned_at.isoformat(),
            "code": scan.code_scanned,
            "location": scan.location or "Unknown"
        })
    
    return Response({"count": len(results), "results": results})


# ── Dashboard Analytics ───────────────────────

@api_view(["GET"])
def dashboard_stats(request):
    """Get dashboard analytics"""
    
    # Overview stats
    total_products = Product.objects.filter(is_active=True).count()
    total_qr_codes = QRCode.objects.filter(is_active=True).count()
    total_scans = ScanRecord.objects.count()
    
    # Fake alerts (scans with WARNING status)
    fake_alerts = ScanRecord.objects.filter(status='WARNING').count()
    verified_scans = ScanRecord.objects.filter(status='VERIFIED').count()
    
    # Weekly data (last 7 days)
    today = timezone.now()
    weekly_data = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        day_scans = ScanRecord.objects.filter(
            scanned_at__gte=day_start,
            scanned_at__lt=day_end
        ).count()
        
        day_alerts = ScanRecord.objects.filter(
            scanned_at__gte=day_start,
            scanned_at__lt=day_end,
            status='WARNING'
        ).count()
        
        weekly_data.append({
            "date": day.strftime("%b %d"),
            "scans": day_scans,
            "alerts": day_alerts
        })
    
    # Recent alerts
    recent_alerts = ScanRecord.objects.filter(
        status='WARNING'
    ).select_related('qr_code__product').order_by('-scanned_at')[:10]
    
    alerts_data = []
    for alert in recent_alerts:
        if alert.qr_code:
            alerts_data.append({
                "product": alert.qr_code.product.name,
                "code": alert.code_scanned,
                "time": alert.scanned_at.isoformat(),
                "location": alert.location or "Unknown"
            })
    
    # Category breakdown
    category_breakdown = Product.objects.filter(
        is_active=True
    ).values('category').annotate(count=Count('id'))
    
    category_data = [
        {"category": item['category'].replace('_', ' ').title(), "count": item['count']}
        for item in category_breakdown
    ]
    
    return Response({
        "overview": {
            "total_products": total_products,
            "total_qr_codes": total_qr_codes,
            "total_scans": total_scans,
            "fake_alerts": fake_alerts,
            "verified_scans": verified_scans
        },
        "weekly_data": weekly_data,
        "recent_alerts": alerts_data,
        "category_breakdown": category_data
    })


# ── Demo QR Codes ─────────────────────────────

@api_view(["GET"])
def demo_codes(request):
    """Get demo QR codes for testing"""
    
    # Get first 5 QR codes with their scan counts
    qr_codes = QRCode.objects.select_related('product').filter(
        is_active=True
    ).order_by('created_at')[:5]
    
    demos = []
    for qr in qr_codes:
        demos.append({
            "code": qr.code_hash,
            "product": qr.product.name,
            "scans_so_far": qr.total_scans,
            "expected_result": "WARNING" if qr.total_scans > 0 else "VERIFIED",
            "qr_image": qr.qr_image_data or _qr_as_base64(qr.code_hash)
        })
    
    return Response(demos)

