from django.apps import apps
from django.contrib import admin

from shared.audit_log.models import AuditLogEntry


class AuditLogEntryAdmin(admin.ModelAdmin):
    fields = ("id", "created_at", "message")
    readonly_fields = ("id", "created_at", "message")


if apps.is_installed("django.contrib.admin"):
    admin.site.register(AuditLogEntry, AuditLogEntryAdmin)
