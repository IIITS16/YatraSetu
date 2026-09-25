
from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/send-otp', views.send_otp),
    path('auth/verify-otp', views.verify_otp),
    path('auth/me', views.get_me),
    path('auth/logout', views.logout),
    
    # Core
    path('verify-guide', views.verify_guide),
    path('scan-bill', views.scan_bill),
    
    # Reports
    path('reports', views.reports),
    
    # Inspector
    path('inspector/stats', views.inspector_stats),
]
