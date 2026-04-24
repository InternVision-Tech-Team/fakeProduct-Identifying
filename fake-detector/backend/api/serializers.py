from rest_framework import serializers
from .models import User, Product, QRCode, ScanRecord, Report


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'company_name', 'phone']
        read_only_fields = ['id']


class ProductSerializer(serializers.ModelSerializer):
    qr_code_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'brand', 'sku', 'batch_number', 'category',
            'description', 'manufacturing_date', 'expiry_date', 'image_url',
            'created_at', 'updated_at', 'is_active', 'qr_code_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_qr_code_count(self, obj):
        return obj.qr_codes.filter(is_active=True).count()


class QRCodeSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    
    class Meta:
        model = QRCode
        fields = [
            'id', 'code_hash', 'qr_image_data', 'total_scans',
            'first_scan_time', 'last_scan_time', 'first_scan_ip',
            'first_scan_location', 'created_at', 'is_active',
            'product_name', 'product_sku'
        ]
        read_only_fields = ['id', 'created_at', 'total_scans', 'first_scan_time', 'last_scan_time']


class ScanRecordSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='qr_code.product.name', read_only=True)
    product_brand = serializers.CharField(source='qr_code.product.brand', read_only=True)
    
    class Meta:
        model = ScanRecord
        fields = [
            'id', 'code_scanned', 'status', 'ip_address', 'user_agent',
            'location', 'latitude', 'longitude', 'scanned_at',
            'product_name', 'product_brand'
        ]
        read_only_fields = ['id', 'scanned_at']


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = [
            'id', 'scan_record', 'user', 'reason', 'additional_info',
            'reported_at', 'is_reviewed', 'admin_notes'
        ]
        read_only_fields = ['id', 'reported_at']
