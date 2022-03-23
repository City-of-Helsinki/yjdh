from django.contrib import admin

from shared.audit_log.models import AuditLogEntry


class AuditLogEntryAdmin(admin.ModelAdmin):
    fields = ("id", "created_at", "message")
    readonly_fields = ("id", "created_at", "message")


admin.site.register(AuditLogEntry, AuditLogEntryAdmin)
