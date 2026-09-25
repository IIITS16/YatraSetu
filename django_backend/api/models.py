
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
