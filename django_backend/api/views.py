
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
        {"merchant_name": "string", "total_amount": 0.0, "gstin_detected": false, "math_is_correct": true, "risk_score": 0, "risk_level": "Low", "detected_reasons": [], "requires_verification": false, "price_anomalies": []}'''
        
        response = model.generate_content([
            prompt,
            {"mime_type": file_obj.content_type, "data": image_data}
        ])
        
        json_str = response.text.replace('```json', '').replace('```', '').strip()
        parsed_data = json.loads(json_str)
        parsed_data.setdefault('price_anomalies', [])
        parsed_data.setdefault('detected_reasons', [])
        parsed_data.setdefault('requires_verification', False)
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
