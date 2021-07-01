from applications.models import (
    Application,
    ApplicationBasis,
    ApplicationLogEntry,
    DeMinimisAid,
    Employee,
)
from django.contrib import admin


class ApplicationBasisInline(admin.TabularInline):
    model = Application.bases.through


class DeMinimisAidInline(admin.StackedInline):
    model = DeMinimisAid
    fk_name = "application"
    extra = 0
    readonly_fields = ("created_at",)


class EmployeeInline(admin.StackedInline):
    model = Employee
    fk_name = "application"
    extra = 0
    readonly_fields = ("created_at",)


class ApplicationAdmin(admin.ModelAdmin):
    inlines = (EmployeeInline, DeMinimisAidInline, ApplicationBasisInline)
    list_filter = ("status",)  # FIXME: "company"
    list_display = (
        "id",
        "status",
        "company_name",
        "company_contact_person_email",
        "created_at",
        "modified_at",
        "__str__",
    )
    search_fields = (
        "id",
        "company__id",
        "official_company_street_address",
        "alternative_company_street_address",
        "company_name",
        "company_contact_person_email",
    )
    date_hierarchy = "created_at"
    ordering = ("-created_at",)
    exclude = ("bases",)


class ApplicationBasisAdmin(admin.ModelAdmin):
    inlines = (ApplicationBasisInline,)


admin.site.register(Application, ApplicationAdmin)
admin.site.register(DeMinimisAid)
admin.site.register(Employee)
admin.site.register(ApplicationBasis, ApplicationBasisAdmin)
admin.site.register(ApplicationLogEntry)
