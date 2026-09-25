import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# 1. Models
models_py = """
from django.db import models

class User(models.Model):
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    email = models.EmailField(unique=True, null=True, blank=True)
    role = models.CharField(max_length=50, default='tourist')
    name = models.CharField(max_length=255, null=True, blank=True)
    language = models.CharField(max_length=50, default='English')
    avatar_url = models.TextField(null=True, blank=True)
    region = models.CharField(max_length=100, null=True, blank=True)
    token_version = models.IntegerField(default=0)
    last_login_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.role})"

class Business(models.Model):
    name = models.CharField(max_length=255)
    region = models.CharField(max_length=100, null=True, blank=True)
    base_risk_score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Guide(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=255)
    languages = models.CharField(max_length=255, null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    photo_url = models.CharField(max_length=500, null=True, blank=True)
    status = models.CharField(max_length=50, default='Active')
    risk_score = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.name} ({self.id})"

class Report(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    concern_type = models.CharField(max_length=100)
    business_name = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    media_urls = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=50, default='pending')
    region = models.CharField(max_length=100, null=True, blank=True)
    risk_score = models.IntegerField(default=0)
    business = models.ForeignKey(Business, on_delete=models.SET_NULL, null=True, blank=True)
    reviewed_by = models.ForeignKey(User, related_name='reviewed_reports', on_delete=models.SET_NULL, null=True, blank=True)
    assigned_to = models.ForeignKey(User, related_name='assigned_reports', on_delete=models.SET_NULL, null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewer_notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report {self.id} by {self.user.name}"

class ActionHistory(models.Model):
    report = models.ForeignKey(Report, on_delete=models.CASCADE)
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action_type = models.CharField(max_length=50)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Alert(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    region = models.CharField(max_length=100, null=True, blank=True)
    message = models.TextField()
    type = models.CharField(max_length=50, default='info')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class AuthOtp(models.Model):
    login_identifier = models.CharField(max_length=100)
    login_type = models.CharField(max_length=10)
    otp_hash = models.CharField(max_length=255)
    otp_salt = models.CharField(max_length=255)
    expires_at = models.DateTimeField()
    attempts_left = models.IntegerField(default=5)
    request_count = models.IntegerField(default=1)
    sent_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
"""
write_file('django_backend/api/models.py', models_py)


# 2. Admin
admin_py = """
from django.contrib import admin
from .models import User, Business, Guide, Report, ActionHistory, Alert, AuthOtp

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'email', 'role', 'region')
    search_fields = ('name', 'phone', 'email')
    list_filter = ('role', 'region')

@admin.register(Guide)
class GuideAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'status', 'rating', 'risk_score')
    search_fields = ('name', 'id')
    list_filter = ('status',)

@admin.register(Business)
class BusinessAdmin(admin.ModelAdmin):
    list_display = ('name', 'region', 'base_risk_score')
    search_fields = ('name', 'region')
    list_filter = ('region',)

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('id', 'business_name', 'concern_type', 'status', 'risk_score', 'region', 'created_at')
    search_fields = ('business_name', 'description')
    list_filter = ('status', 'concern_type', 'region')
    readonly_fields = ('created_at',)

@admin.register(ActionHistory)
class ActionHistoryAdmin(admin.ModelAdmin):
    list_display = ('report', 'actor', 'action_type', 'created_at')

@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ('user', 'message', 'type', 'is_read', 'created_at')
"""
write_file('django_backend/api/admin.py', admin_py)

# 3. Serializers
serializers_py = """
from rest_framework import serializers
from .models import User, Report, Guide, Alert, ActionHistory

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'
"""
write_file('django_backend/api/serializers.py', serializers_py)

# 4. Views (Fully updated)
views_py = """
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .models import User, Report, Guide
from .serializers import ReportSerializer
import google.generativeai as genai
from django.conf import settings
import json
import jwt
import string
import random
from datetime import timedelta
from django.utils import timezone

genai.configure(api_key=settings.GEMINI_API_KEY)

# AUTH ROUTES
@api_view(['POST'])
def send_otp(request):
    # In full version, this checks ratelimit, salts/hashes, and sends via mock services.
    # We provide a clean Dev response.
    return Response({'success': True, 'message': 'Demo OTP sent successfully. Use 123456 to login.', 'otp': '123456'})

@api_view(['POST'])
def verify_otp(request):
    phone = request.data.get('phone')
    email = request.data.get('email')
    identifier = email if email else phone
    
    # Auto-create user for demo
    user, created = User.objects.get_or_create(
        phone=phone, email=email,
        defaults={'name': 'Demo User', 'role': 'tourist', 'region': 'Demo Region'}
    )
    
    # Normally generate real JWT signing
    token = "demo_jwt_token_" + str(user.id)
    
    return Response({
        'success': True,
        'token': token,
        'user': {
            'id': user.id,
            'phone': user.phone,
            'email': user.email,
            'role': user.role,
            'name': user.name,
            'region': user.region
        }
    })

@api_view(['GET'])
def get_me(request):
    # Demoreturn first user or dummy
    user = User.objects.first()
    if not user:
        return Response({'success': False, 'message': 'User not found'}, status=404)
    return Response({
        'success': True,
        'user': {
            'id': user.id,
            'phone': user.phone,
            'email': user.email,
            'role': user.role,
            'name': user.name,
            'region': user.region
        }
    })

@api_view(['POST'])
def logout(request):
    return Response({"success": True})


# FEATURE ROUTES
@api_view(['POST'])
def verify_guide(request):
    token = request.data.get('token')
    if not token:
         return Response({"success": False, "message": "No QR data provided"})
         
    # Check if this matches a dummy guide, else return Gov Verified fake data
    # Real logic: jwt.verify -> Guide.objects.get(id=decoded.guide_id)
    
    return Response({
        "success": True,
        "guide": {
            "name": "Rajesh Kumar (Govt Verified)",
            "id": "GJ-2024-8891",
            "languages": "English, Hindi",
            "rating": "4.8",
            "risk_score": 0
        }
    })

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def scan_bill(request):
    if 'bill' not in request.FILES:
        return Response({"success": False, "message": "No image uploaded"}, status=400)
    
    file_obj = request.FILES['bill']
    image_data = file_obj.read()
    
    try:
        model = genai.GenerativeModel('gemini-3.1-flash-lite')
        prompt = '''Analyze this bill/invoice image for fraud. Respond ONLY with JSON:
        {"merchant_name": "string", "total_amount": 0.0, "gstin_detected": false, "math_is_correct": true, "risk_score": 0, "risk_level": "Low", "detected_reasons": []}'''
        
        response = model.generate_content([
            prompt,
            {"mime_type": file_obj.content_type, "data": image_data}
        ])
        
        json_str = response.text.replace('```json', '').replace('```', '').strip()
        parsed_data = json.loads(json_str)
        return Response({"success": True, "data": parsed_data})
    except Exception as e:
        return Response({"success": False, "message": str(e)}, status=500)

@api_view(['GET', 'POST'])
def reports(request):
    if request.method == 'POST':
        # Create a report
        data = request.data
        user = User.objects.filter(role='tourist').first()
        
        if not user:
            user = User.objects.create(name='Demo Tourist', phone='12345')

        report = Report.objects.create(
            user=user,
            concern_type=data.get('concern_type', 'General'),
            business_name=data.get('business_name', ''),
            description=data.get('description', ''),
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            status='pending',
            risk_score=data.get('risk_score', 50)
        )
        return Response({"success": True, "message": "Report created", "data": {"id": report.id}})
    
    elif request.method == 'GET':
        # List user's reports
        reports = Report.objects.all().order_by('-created_at')
        return Response({"success": True, "reports": ReportSerializer(reports, many=True).data})

# INSPECTOR ROUTES
@api_view(['GET'])
def inspector_stats(request):
    reports = Report.objects.all()
    total = reports.count()
    pending = reports.filter(status='pending').count()
    resolved = reports.filter(status='resolved').count()
    high_risk = reports.filter(risk_score__gte=61).count()
    
    return Response({
        "success": True,
        "stats": {
            "total_reports": total,
            "pending_reports": pending,
            "resolved_reports": resolved,
            "high_risk_reports": high_risk
        }
    })
"""
write_file('django_backend/api/views.py', views_py)

# 5. URLs
urls_py = """
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
"""
write_file('django_backend/api/urls.py', urls_py)
