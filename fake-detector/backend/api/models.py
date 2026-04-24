import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
    """Custom user model with role support"""
    ROLE_CHOICES = [
        ('consumer', 'Consumer'),
        ('brand', 'Brand'),
        ('admin', 'Admin'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='consumer')
    phone = models.CharField(max_length=20, blank=True, null=True)
    company_name = models.CharField(max_length=255, blank=True, null=True)
    
    class Meta:
        db_table = 'users'
        ordering = ['-date_joined']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
        ]
    
    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"


class Brand(models.Model):
    """Brand/Manufacturer profile"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='brand_profile')
    company_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    logo_url = models.URLField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'brands'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['is_verified']),
        ]
    
    def __str__(self):
        return self.company_name


class Product(models.Model):
    """Product catalog"""
    CATEGORY_CHOICES = [
        ('electronics', 'Electronics'),
        ('food_beverage', 'Food & Beverage'),
        ('cosmetics', 'Cosmetics'),
        ('pharmaceuticals', 'Pharmaceuticals'),
        ('clothing', 'Clothing'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    brand_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
    
    name = models.CharField(max_length=255)
    brand = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    sku = models.CharField(max_length=100, unique=True, db_index=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    batch_number = models.CharField(max_length=100)
    manufacturing_date = models.DateField()
    expiry_date = models.DateField()
    image_url = models.URLField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['brand_user', 'is_active']),
            models.Index(fields=['sku']),
            models.Index(fields=['category']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.sku})"


class QRCode(models.Model):
    """QR Code records for anti-counterfeiting"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='qr_codes')
    code_hash = models.CharField(max_length=255, unique=True, db_index=True)
    code_text = models.CharField(max_length=255, unique=True)
    qr_image_data = models.TextField(blank=True)  # Base64 encoded QR image
    
    # Scan tracking
    total_scans = models.IntegerField(default=0)
    first_scan_time = models.DateTimeField(blank=True, null=True)
    first_scan_ip = models.GenericIPAddressField(blank=True, null=True)
    first_scan_location = models.CharField(max_length=255, null=True, blank=True)
    last_scan_time = models.DateTimeField(blank=True, null=True)
    last_scan_ip = models.GenericIPAddressField(blank=True, null=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'qr_codes'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['code_hash']),
            models.Index(fields=['product', 'is_active']),
            models.Index(fields=['total_scans']),
        ]
    
    def __str__(self):
        return f"{self.product.name} - {self.code_text[:20]}"


class ScanRecord(models.Model):
    """Individual scan records for tracking and analytics"""
    STATUS_CHOICES = [
        ('verified', 'Verified'),
        ('warning', 'Warning'),
        ('invalid', 'Invalid'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    qr_code = models.ForeignKey(QRCode, on_delete=models.SET_NULL, null=True, blank=True, related_name='scans')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='scans')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='scans')
    
    code_scanned = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    message = models.TextField(blank=True)
    
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    scanned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'scan_records'
        ordering = ['-scanned_at']
        indexes = [
            models.Index(fields=['qr_code', 'scanned_at']),
            models.Index(fields=['user', 'scanned_at']),
            models.Index(fields=['status', 'scanned_at']),
            models.Index(fields=['scanned_at']),
        ]
    
    def __str__(self):
        return f"{self.code_scanned} - {self.get_status_display()} at {self.scanned_at}"


class Report(models.Model):
    """Reports submitted by consumers for suspicious products"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('investigating', 'Investigating'),
        ('confirmed_fake', 'Confirmed Fake'),
        ('verified_genuine', 'Verified Genuine'),
        ('closed', 'Closed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    qr_code = models.ForeignKey(QRCode, on_delete=models.CASCADE, related_name='reports')
    scan_record = models.ForeignKey(ScanRecord, on_delete=models.SET_NULL, null=True, blank=True, related_name='reports')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reports')
    
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
    reason = models.TextField()
    additional_info = models.TextField(blank=True)
    evidence_url = models.URLField(blank=True, null=True)
    
    admin_notes = models.TextField(blank=True)
    is_reviewed = models.BooleanField(default=False)
    
    reported_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reports'
        ordering = ['-reported_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['qr_code']),
        ]
    
    def __str__(self):
        return f"Report for {self.qr_code.code_text[:20]}"


class SubscriptionPlan(models.Model):
    """Subscription plans for brands"""
    TIER_CHOICES = [
        ('free', 'Free'),
        ('basic', 'Basic'),
        ('professional', 'Professional'),
        ('enterprise', 'Enterprise'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tier = models.CharField(max_length=50, choices=TIER_CHOICES, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    
    # Limits
    max_products = models.IntegerField()
    max_qr_codes_per_month = models.IntegerField()
    max_scans_per_day = models.IntegerField(null=True, blank=True)
    
    # Features
    has_analytics = models.BooleanField(default=False)
    has_api_access = models.BooleanField(default=False)
    has_bulk_export = models.BooleanField(default=False)
    has_priority_support = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'subscription_plans'
        ordering = ['price']
    
    def __str__(self):
        return f"{self.name} (${self.price})"


class BrandSubscription(models.Model):
    """Brand subscription status"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
        ('suspended', 'Suspended'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    brand_user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.SET_NULL, null=True)
    
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='active')
    
    # Billing period
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    renewal_date = models.DateTimeField()
    
    # Usage tracking
    qr_codes_used_this_month = models.IntegerField(default=0)
    scans_today = models.IntegerField(default=0)
    last_reset_date = models.DateField(auto_now_add=True)
    
    # Payment
    stripe_subscription_id = models.CharField(max_length=255, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'brand_subscriptions'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.brand_user.company_name} - {self.get_status_display()}"

