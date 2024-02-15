from django import forms
from django.contrib import admin
from django.utils.safestring import mark_safe

from applications.models import (
    AhjoSetting,
    Application,
    ApplicationBasis,
    ApplicationBatch,
    ApplicationLogEntry,
    Attachment,
    DecisionProposalTemplateSection,
    DeMinimisAid,
    Employee,
)
from calculator.admin import CalculationInline


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
        CalculationInline,
    )
    list_filter = ("status", "application_origin", "company")
    list_display = (
        "id",
        "status",
        "application_origin",
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
        "company_department",
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


class AhjoSettingAdmin(admin.ModelAdmin):
    list_display = ["name", "data"]
    search_fields = ["name"]


class SafeTextareaWidget(forms.Textarea):
    def format_value(self, value):
        # Marks the value as safe, preventing auto-escaping
        return mark_safe(value) if value is not None else ""


class DecisionProposalTemplateSectionFormAdmin(forms.ModelForm):
    class Meta:
        model = DecisionProposalTemplateSection
        fields = "__all__"
        widgets = {
            "template_text": SafeTextareaWidget(),
        }


class DecisionProposalTemplateSectionAdmin(admin.ModelAdmin):
    list_display = ["name"]
    search_fields = ["name"]


admin.site.register(Application, ApplicationAdmin)
admin.site.register(ApplicationBatch, ApplicationBatchAdmin)
admin.site.register(DeMinimisAid)
admin.site.register(Employee)
admin.site.register(Attachment)
admin.site.register(ApplicationBasis, ApplicationBasisAdmin)
admin.site.register(ApplicationLogEntry)
admin.site.register(AhjoSetting, AhjoSettingAdmin)
admin.site.register(
    DecisionProposalTemplateSection, DecisionProposalTemplateSectionAdmin
)
