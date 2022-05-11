# Register your models here.
from django.contrib import admin  # noqa

from companies.models import Company


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "business_id", "company_form")
    exclude = ("id",)
