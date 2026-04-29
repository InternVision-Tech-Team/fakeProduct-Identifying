from django.urls import path
from . import views

urlpatterns = [
    path('health/',              views.health_check,   name='health'),
    path('auth/login/',          views.login_view,     name='login'),
    path('auth/register/',       views.register_view,  name='register'),
    path('products/',            views.products_list,  name='products-list'),
    path('products/<str:product_id>/', views.product_detail, name='product-detail'),
    path('qrcodes/generate/',    views.generate_qr,    name='generate-qr'),
    path('scan/',                views.scan_code,       name='scan'),
    path('scans/',               views.scan_records,    name='scan-records-list'),
    path('scans/history/',       views.scan_history,   name='scan-history'),
    path('qr-codes/',            views.qr_codes_list,   name='qr-codes-list'),
    path('dashboard/stats/',     views.dashboard_stats, name='dashboard-stats'),
    path('demo/codes/',          views.demo_codes,     name='demo-codes'),
]
