from django.apps import apps
from django.contrib import admin

from companies.models import Company


class CompanyAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "business_id",
        "city",
    ]
    list_filter = ["city"]
    search_fields = ["name", "business_id"]
    readonly_fields = ["ytj_json"]

    def has_add_permission(self, request):
        """Disable add permission."""
        return False

    def has_delete_permission(self, request, obj=None):
        """Disable delete permission."""
        return False

    def has_change_permission(self, request, obj=None):
        """Disable change permission."""
        return False


if apps.is_installed("django.contrib.admin"):
    admin.site.register(Company, CompanyAdmin)
