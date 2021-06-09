# Register your models here.
from companies.models import Company
from django.contrib import admin  # noqa


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "business_id", "company_form")
    exclude = ("id",)
