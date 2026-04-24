from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Product, QRCode, ScanRecord, Report


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'role', 'company_name', 'is_staff', 'is_active']
    list_filter = ['role', 'is_staff', 'is_active']
    search_fields = ['username', 'email', 'company_name']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Extended Info', {'fields': ('role', 'company_name', 'phone')}),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Extended Info', {'fields': ('role', 'company_name', 'phone')}),
    )


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'brand', 'sku', 'category', 'batch_number', 'brand_user', 'is_active', 'created_at']
    list_filter = ['category', 'is_active', 'created_at']
    search_fields = ['name', 'brand', 'sku', 'batch_number']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('brand_user', 'name', 'brand', 'sku', 'category')
        }),
        ('Details', {
            'fields': ('batch_number', 'description', 'image_url')
        }),
        ('Dates', {
            'fields': ('manufacturing_date', 'expiry_date')
        }),
        ('Status', {
            'fields': ('is_active', 'created_at', 'updated_at')
        }),
    )


@admin.register(QRCode)
class QRCodeAdmin(admin.ModelAdmin):
    list_display = ['code_hash', 'product', 'total_scans', 'first_scan_time', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at', 'total_scans']
    search_fields = ['code_hash', 'product__name', 'product__sku']
    readonly_fields = ['id', 'created_at', 'total_scans', 'first_scan_time', 'last_scan_time']
    
    fieldsets = (
        ('QR Code Info', {
            'fields': ('product', 'code_hash', 'qr_image_data', 'is_active')
        }),
        ('Scan Statistics', {
            'fields': ('total_scans', 'first_scan_time', 'last_scan_time', 'first_scan_ip', 'first_scan_location')
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )


@admin.register(ScanRecord)
class ScanRecordAdmin(admin.ModelAdmin):
    list_display = ['code_scanned', 'status', 'qr_code', 'user', 'ip_address', 'location', 'scanned_at']
    list_filter = ['status', 'scanned_at']
    search_fields = ['code_scanned', 'ip_address', 'location']
    readonly_fields = ['id', 'scanned_at']
    
    fieldsets = (
        ('Scan Info', {
            'fields': ('qr_code', 'user', 'code_scanned', 'status')
        }),
        ('Technical Details', {
            'fields': ('ip_address', 'user_agent')
        }),
        ('Location', {
            'fields': ('location', 'latitude', 'longitude')
        }),
        ('Timestamp', {
            'fields': ('scanned_at',)
        }),
    )


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['scan_record', 'user', 'reported_at', 'is_reviewed']
    list_filter = ['is_reviewed', 'reported_at']
    search_fields = ['reason', 'scan_record__code_scanned']
    readonly_fields = ['id', 'reported_at']
    
    fieldsets = (
        ('Report Info', {
            'fields': ('scan_record', 'user', 'reason', 'additional_info')
        }),
        ('Review', {
            'fields': ('is_reviewed', 'admin_notes')
        }),
        ('Timestamp', {
            'fields': ('reported_at',)
        }),
    )
