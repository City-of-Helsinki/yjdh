from applications.models import (
    Application,
    ApplicationBasis,
    ApplicationBatch,
    ApplicationLogEntry,
    Attachment,
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


class AttachmentInline(admin.StackedInline):
    model = Attachment
    fk_name = "application"
    extra = 0
    readonly_fields = ("created_at",)


class ApplicationAdmin(admin.ModelAdmin):
    inlines = (
        EmployeeInline,
        DeMinimisAidInline,
        ApplicationBasisInline,
        AttachmentInline,
    )
    list_filter = ("status", "company")
    list_display = (
        "id",
        "status",
        "application_number",
        "company_name",
        "company_contact_person_email",
        "company_contact_person_first_name",
        "company_contact_person_last_name",
        "created_at",
        "modified_at",
        "__str__",
    )
    search_fields = (
        "id",
        "company__id",
        "application_number",
        "official_company_street_address",
        "alternative_company_street_address",
        "company_name",
        "company_contact_person_email",
        "company_contact_person_first_name",
        "company_contact_person_last_name",
    )
    date_hierarchy = "created_at"
    ordering = ("-created_at",)
    exclude = ("bases",)


class ApplicationInline(admin.StackedInline):
    model = Application
    show_change_link = True
    fk_name = "batch"
    extra = 0
    fields = ("application_number", "status", "company_name")
    readonly_fields = ("application_number", "company_name")


class ApplicationBatchAdmin(admin.ModelAdmin):
    inlines = (ApplicationInline,)
    show_change_link = True
    list_filter = ("status", "proposal_for_decision")
    list_display = (
        "id",
        "status",
        "proposal_for_decision",
        "decision_date",
    )


class ApplicationBasisAdmin(admin.ModelAdmin):
    inlines = (ApplicationBasisInline,)


admin.site.register(Application, ApplicationAdmin)
admin.site.register(ApplicationBatch, ApplicationBatchAdmin)
admin.site.register(DeMinimisAid)
admin.site.register(Employee)
admin.site.register(Attachment)
admin.site.register(ApplicationBasis, ApplicationBasisAdmin)
admin.site.register(ApplicationLogEntry)
