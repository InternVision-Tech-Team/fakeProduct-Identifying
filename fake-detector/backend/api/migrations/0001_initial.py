# Generated migration for api models

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(error_messages={'unique': 'A user with that username already exists.'}, help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.', max_length=150, unique=True, verbose_name='username')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('email', models.EmailField(blank=True, max_length=254, verbose_name='email address')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Uncheck this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(auto_now_add=True, verbose_name='date joined')),
                ('role', models.CharField(choices=[('consumer', 'Consumer'), ('brand', 'Brand'), ('admin', 'Admin')], default='consumer', max_length=20)),
                ('phone', models.CharField(blank=True, max_length=20, null=True)),
                ('company_name', models.CharField(blank=True, max_length=255, null=True)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'db_table': 'users',
                'ordering': ['-date_joined'],
            },
        ),
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('brand', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('sku', models.CharField(db_index=True, max_length=100, unique=True)),
                ('category', models.CharField(choices=[('electronics', 'Electronics'), ('food_beverage', 'Food & Beverage'), ('cosmetics', 'Cosmetics'), ('pharmaceuticals', 'Pharmaceuticals'), ('clothing', 'Clothing'), ('other', 'Other')], default='other', max_length=50)),
                ('batch_number', models.CharField(max_length=100)),
                ('manufacturing_date', models.DateField()),
                ('expiry_date', models.DateField()),
                ('image_url', models.URLField(blank=True, null=True)),
                ('price', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('brand_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='products', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'products',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='SubscriptionPlan',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('tier', models.CharField(choices=[('free', 'Free'), ('basic', 'Basic'), ('professional', 'Professional'), ('enterprise', 'Enterprise')], max_length=50, unique=True)),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('currency', models.CharField(default='USD', max_length=3)),
                ('max_products', models.IntegerField()),
                ('max_qr_codes_per_month', models.IntegerField()),
                ('max_scans_per_day', models.IntegerField(blank=True, null=True)),
                ('has_analytics', models.BooleanField(default=False)),
                ('has_api_access', models.BooleanField(default=False)),
                ('has_bulk_export', models.BooleanField(default=False)),
                ('has_priority_support', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'subscription_plans',
                'ordering': ['price'],
            },
        ),
        migrations.CreateModel(
            name='QRCode',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('code_hash', models.CharField(db_index=True, max_length=255, unique=True)),
                ('code_text', models.CharField(max_length=255, unique=True)),
                ('qr_image_data', models.TextField(blank=True)),
                ('total_scans', models.IntegerField(default=0)),
                ('first_scan_time', models.DateTimeField(blank=True, null=True)),
                ('first_scan_ip', models.GenericIPAddressField(blank=True, null=True)),
                ('first_scan_location', models.CharField(blank=True, max_length=255, null=True)),
                ('last_scan_time', models.DateTimeField(blank=True, null=True)),
                ('last_scan_ip', models.GenericIPAddressField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='qr_codes', to='api.product')),
            ],
            options={
                'db_table': 'qr_codes',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ScanRecord',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('code_scanned', models.CharField(max_length=255)),
                ('status', models.CharField(choices=[('verified', 'Verified'), ('warning', 'Warning'), ('invalid', 'Invalid')], max_length=20)),
                ('message', models.TextField(blank=True)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user_agent', models.TextField(blank=True)),
                ('location', models.CharField(blank=True, max_length=255, null=True)),
                ('latitude', models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ('longitude', models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True)),
                ('scanned_at', models.DateTimeField(auto_now_add=True)),
                ('product', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='scans', to='api.product')),
                ('qr_code', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='scans', to='api.qrcode')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='scans', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'scan_records',
                'ordering': ['-scanned_at'],
            },
        ),
        migrations.CreateModel(
            name='Report',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('investigating', 'Investigating'), ('confirmed_fake', 'Confirmed Fake'), ('verified_genuine', 'Verified Genuine'), ('closed', 'Closed')], default='pending', max_length=50)),
                ('reason', models.TextField()),
                ('additional_info', models.TextField(blank=True)),
                ('evidence_url', models.URLField(blank=True, null=True)),
                ('admin_notes', models.TextField(blank=True)),
                ('is_reviewed', models.BooleanField(default=False)),
                ('reported_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('qr_code', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reports', to='api.qrcode')),
                ('scan_record', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='reports', to='api.scanrecord')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='reports', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'reports',
                'ordering': ['-reported_at'],
            },
        ),
        migrations.CreateModel(
            name='Brand',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('company_name', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('logo_url', models.URLField(blank=True, null=True)),
                ('website', models.URLField(blank=True, null=True)),
                ('email', models.EmailField(max_length=254)),
                ('phone', models.CharField(blank=True, max_length=20)),
                ('country', models.CharField(blank=True, max_length=100)),
                ('is_verified', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='brand_profile', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'brands',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='BrandSubscription',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('status', models.CharField(choices=[('active', 'Active'), ('cancelled', 'Cancelled'), ('expired', 'Expired'), ('suspended', 'Suspended')], default='active', max_length=50)),
                ('start_date', models.DateTimeField(auto_now_add=True)),
                ('end_date', models.DateTimeField()),
                ('renewal_date', models.DateTimeField()),
                ('qr_codes_used_this_month', models.IntegerField(default=0)),
                ('scans_today', models.IntegerField(default=0)),
                ('last_reset_date', models.DateField(auto_now_add=True)),
                ('stripe_subscription_id', models.CharField(blank=True, max_length=255, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('brand_user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='subscription', to=settings.AUTH_USER_MODEL)),
                ('plan', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.subscriptionplan')),
            ],
            options={
                'db_table': 'brand_subscriptions',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['email'], name='users_email_idx'),
        ),
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['role'], name='users_role_idx'),
        ),
        migrations.AddIndex(
            model_name='scanrecord',
            index=models.Index(fields=['qr_code', 'scanned_at'], name='scan_records_qr_code_scanned_at_idx'),
        ),
        migrations.AddIndex(
            model_name='scanrecord',
            index=models.Index(fields=['user', 'scanned_at'], name='scan_records_user_scanned_at_idx'),
        ),
        migrations.AddIndex(
            model_name='scanrecord',
            index=models.Index(fields=['status', 'scanned_at'], name='scan_records_status_scanned_at_idx'),
        ),
        migrations.AddIndex(
            model_name='scanrecord',
            index=models.Index(fields=['scanned_at'], name='scan_records_scanned_at_idx'),
        ),
        migrations.AddIndex(
            model_name='qrcode',
            index=models.Index(fields=['code_hash'], name='qr_codes_code_hash_idx'),
        ),
        migrations.AddIndex(
            model_name='qrcode',
            index=models.Index(fields=['product', 'is_active'], name='qr_codes_product_is_active_idx'),
        ),
        migrations.AddIndex(
            model_name='qrcode',
            index=models.Index(fields=['total_scans'], name='qr_codes_total_scans_idx'),
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['brand_user', 'is_active'], name='products_brand_user_is_active_idx'),
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['sku'], name='products_sku_idx'),
        ),
        migrations.AddIndex(
            model_name='product',
            index=models.Index(fields=['category'], name='products_category_idx'),
        ),
        migrations.AddIndex(
            model_name='report',
            index=models.Index(fields=['status'], name='reports_status_idx'),
        ),
        migrations.AddIndex(
            model_name='report',
            index=models.Index(fields=['qr_code'], name='reports_qr_code_idx'),
        ),
        migrations.AddIndex(
            model_name='brand',
            index=models.Index(fields=['is_active'], name='brands_is_active_idx'),
        ),
        migrations.AddIndex(
            model_name='brand',
            index=models.Index(fields=['is_verified'], name='brands_is_verified_idx'),
        ),
    ]
