import os

def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# 1. config/settings.py modifications
settings_path = 'django_backend/core/settings.py'
with open(settings_path, 'r', encoding='utf-8') as f:
    settings = f.read()

settings = settings.replace(
    "INSTALLED_APPS = [",
    "INSTALLED_APPS = [\n    'corsheaders',\n    'rest_framework',\n    'api',\n"
)
settings = settings.replace(
    "MIDDLEWARE = [",
    "MIDDLEWARE = [\n    'corsheaders.middleware.CorsMiddleware',\n"
)
# Add at the end
settings += """
CORS_ALLOW_ALL_ORIGINS = True # For hackathon
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ]
}

import os
from dotenv import load_dotenv
load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
"""
create_file(settings_path, settings)


# 2. api/models.py
models_content = """from django.db import models
from django.utils import timezone

class User(models.Model):
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    email = models.EmailField(unique=True, null=True, blank=True)
    role = models.CharField(max_length=20, default='tourist')
    name = models.CharField(max_length=100, null=True, blank=True)
    token_version = models.IntegerField(default=0)
    last_login_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Report(models.Model):
    user = models.ForeignKey(User, on_delete=models.RESTRICT)
    concern_type = models.CharField(max_length=100)
    business_name = models.CharField(max_length=200, null=True, blank=True)
    description = models.TextField()
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=50, default='Under review')
    created_at = models.DateTimeField(auto_now_add=True)

class AuthOtp(models.Model):
    login_identifier = models.CharField(max_length=100)
    login_type = models.CharField(max_length=10) # 'phone' or 'email'
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
create_file('django_backend/api/models.py', models_content)


# 3. api/serializers.py
serializers_content = """from rest_framework import serializers
from .models import User, Report

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'
"""
create_file('django_backend/api/serializers.py', serializers_content)


# 4. api/views.py
views_content = """from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .models import User, Report
from .serializers import ReportSerializer
import google.generativeai as genai
from django.conf import settings
import json
import jwt

genai.configure(api_key=settings.GEMINI_API_KEY)

@api_view(['GET'])
def test_db(request):
    return Response({"success": True, "message": "Django Backend Connected!"})

@api_view(['POST'])
def verify_guide(request):
    token = request.data.get('token')
    if not token:
         return Response({"success": False, "message": "No token provided"})
    # Dummy logic to match Node response
    return Response({
        "success": True,
        "guide": {
            "name": "Rajesh Kumar (Django)",
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

@api_view(['POST'])
def create_report(request):
    # Dummy creation logic for MVP
    serializer = ReportSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"success": True, "data": serializer.data})
    return Response({"success": False, "errors": serializer.errors})
"""
create_file('django_backend/api/views.py', views_content)


# 5. api/urls.py
api_urls_content = """from django.urls import path
from . import views

urlpatterns = [
    path('test-db', views.test_db),
    path('verify-guide', views.verify_guide),
    path('scan-bill', views.scan_bill),
    path('reports', views.create_report),
]
"""
create_file('django_backend/api/urls.py', api_urls_content)


# 6. core/urls.py
core_urls_content = """from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
"""
create_file('django_backend/core/urls.py', core_urls_content)
