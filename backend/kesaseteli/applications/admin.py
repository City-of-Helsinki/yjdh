from django.apps import apps
from django.contrib import admin

from applications.models import School


class SchoolAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "created_at",
        "modified_at",
    ]
    list_filter = [
        "created_at",
        "modified_at",
    ]
    date_hierarchy = "created_at"
    search_fields = ["name"]


if apps.is_installed("django.contrib.admin"):
    admin.site.register(School, SchoolAdmin)
