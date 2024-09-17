from django import forms
from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html
from django.utils.safestring import mark_safe

from applications.models import (
    AhjoDecisionText,
    AhjoSetting,
    AhjoStatus,
    Application,
    ApplicationAlteration,
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


class AhjoStatusInline(admin.TabularInline):
    model = AhjoStatus
    fk_name = "application"
    extra = 0
    readonly_fields = ("created_at",)


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


class ApplicationAlterationInline(admin.StackedInline):
    model = ApplicationAlteration
    fk_name = "application"
    extra = 0
    fields = (
        # Common state
        "state",
        "alteration_type",
        # Applicant-provided data
        "end_date",
        "resume_date",
        "reason",
        "contact_person_name",
        "use_einvoice",
        "einvoice_provider_name",
        "einvoice_provider_identifier",
        "einvoice_address",
        # Handler-provided data
        "is_recoverable",
        "handled_at",
        "handled_by",
        "recovery_start_date",
        "recovery_end_date",
        "recovery_amount",
        "recovery_justification",
        "cancelled_at",
        "cancelled_by",
    )


class ApplicationAdmin(admin.ModelAdmin):
    inlines = (
        EmployeeInline,
        DeMinimisAidInline,
        ApplicationBasisInline,
        AttachmentInline,
        CalculationInline,
        ApplicationAlterationInline,
        AhjoStatusInline,
    )
    list_filter = ("status", "application_origin", "company")
    list_display = (
        "id",
        "status",
        "application_origin",
        "application_number",
        "ahjo_case_id",
        "company_name",
        "company_contact_person_email",
        "company_contact_person_first_name",
        "company_contact_person_last_name",
        "batch",
        "created_at",
        "modified_at",
        "__str__",
    )
    search_fields = (
        "id",
        "company__id",
        "application_number",
        "ahjo_case_id",
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

    readonly_fields = ["batch_details"]

    def batch_details(self, obj):
        if obj.batch:
            url = reverse(
                "admin:applications_applicationbatch_change", args=[obj.batch.id]
            )
            return format_html(
                '<a href="{}">{}</a>',
                url,
                obj.batch.id,
            )

        return "Not assigned to any batch"

    batch_details.short_description = "Batch Details"


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


class AhjoDecisionTextFormAdmin(forms.ModelForm):
    class Meta:
        model = AhjoDecisionText
        fields = "__all__"
        widgets = {
            "decision_text": SafeTextareaWidget(),
        }


class AhjoDecisionTextAdmin(admin.ModelAdmin):
    form = AhjoDecisionTextFormAdmin
    list_display = ["id", "decision_type", "application_id"]
    search_fields = ["id", "decision_type", "application_id"]


class ApplicationLogEntryAdmin(admin.ModelAdmin):
    fields = [
        "application",
        "created_at",
        "modified_at",
        "from_status",
        "to_status",
        "comment",
    ]
    list_display = ["application", "created_at", "modified_at"]
    readonly_fields = ["created_at", "modified_at"]
    search_fields = ["application__id"]


class EmployeeAdmin(admin.ModelAdmin):
    exclude = ("encrypted_social_security_number", "social_security_number")
    list_display = [
        "id",
        "first_name",
        "last_name",
        "application",
        "created_at",
        "modified_at",
    ]
    search_fields = ["id", "application__id"]


admin.site.register(Application, ApplicationAdmin)
admin.site.register(ApplicationBatch, ApplicationBatchAdmin)
admin.site.register(DeMinimisAid)
admin.site.register(Employee, EmployeeAdmin)
admin.site.register(Attachment)
admin.site.register(ApplicationBasis, ApplicationBasisAdmin)
admin.site.register(ApplicationLogEntry, ApplicationLogEntryAdmin)
admin.site.register(AhjoSetting, AhjoSettingAdmin)
admin.site.register(
    DecisionProposalTemplateSection, DecisionProposalTemplateSectionAdmin
)
admin.site.register(AhjoDecisionText, AhjoDecisionTextAdmin)
