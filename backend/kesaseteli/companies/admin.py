import logging

from auditlog_extra.mixins import AuditlogAdminViewAccessLogMixin
from django.apps import apps
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.translation import ngettext

from companies.models import Company
from companies.services import update_company_from_ytj


class CompanyAdmin(AuditlogAdminViewAccessLogMixin, admin.ModelAdmin):
    list_display = [
        "name",
        "business_id",
        "city",
    ]
    list_filter = ["city"]
    search_fields = ["name", "business_id"]
    readonly_fields = ["ytj_json"]
    actions = ["update_from_ytj"]

    def has_add_permission(self, request):
        """Disable add permission."""
        return False

    def has_delete_permission(self, request, obj=None):
        """Disable delete permission."""
        return False

    def has_change_permission(self, request, obj=None):
        """Disable change permission."""
        return False

    @admin.action(description=_("Update selected companies from YTJ"))
    def update_from_ytj(self, request, queryset):
        success_count = 0
        failed_count = 0
        for company in queryset:
            try:
                update_company_from_ytj(company, raise_exception=True)
                success_count += 1
            except Exception:
                failed_count += 1

        if success_count > 0:
            self.message_user(
                request,
                ngettext(
                    "Successfully updated {count} company from YTJ.",
                    "Successfully updated {count} companies from YTJ.",
                    success_count,
                ).format(count=success_count),
                level=logging.INFO,
            )

        if failed_count > 0:
            self.message_user(
                request,
                ngettext(
                    "Failed to update {count} company from YTJ.",
                    "Failed to update {count} companies from YTJ.",
                    failed_count,
                ).format(count=failed_count),
                level=logging.ERROR,
            )


if apps.is_installed("django.contrib.admin"):
    admin.site.register(Company, CompanyAdmin)
