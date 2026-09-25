
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
