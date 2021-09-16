# Register your models here.
from django.contrib import admin  # noqa
from terms.models import ApplicantConsent, ApplicantTermsApproval, Terms


@admin.register(ApplicantConsent)
class ApplicantConsentAdmin(admin.ModelAdmin):
    list_filter = ("terms",)


class ApplicantConsentInline(admin.StackedInline):
    exclude = ("id",)
    model = ApplicantConsent
    fk_name = "terms"
    extra = 3
    readonly_fields = ("created_at",)
    list_filter = ("terms",)


@admin.register(Terms)
class TermsAdmin(admin.ModelAdmin):
    inlines = (ApplicantConsentInline,)
    list_display = ("id", "terms_type", "effective_from")


class ApprovedApplicantConsentInline(admin.ModelAdmin):
    model = ApplicantConsent
    fk_name = "terms"
    extra = 0
    readonly_fields = ("created_at",)


class ApprovedConsentInline(admin.TabularInline):
    model = ApplicantConsent.applicanttermsapproval_set.through


@admin.register(ApplicantTermsApproval)
class ApplicantTermsApprovalAdmin(admin.ModelAdmin):
    inlines = (ApprovedConsentInline,)
    list_display = (
        "approved_at",
        "approved_by",
        "terms",
    )
    list_filter = (
        "approved_by__email",
        "approved_by__last_name",
        "approved_by__last_name",
        "terms__terms_type",
        "terms__effective_from",
    )
    search_fields = (
        "approved_by__email",
        "approved_by__first_name",
        "approved_by__last_name",
    )
    date_hierarchy = "approved_at"
    ordering = ("-approved_at",)
