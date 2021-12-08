from calculator.models import (
    Calculation,
    CalculationRow,
    PaySubsidy,
    PreviousBenefit,
    TrainingCompensation,
)
from django.contrib import admin


class CalculationRowInline(admin.StackedInline):
    exclude = ("id",)
    model = CalculationRow
    fk_name = "calculation"
    extra = 5
    readonly_fields = ("created_at",)
    list_filter = ("calculation",)


class CalculationAdmin(admin.ModelAdmin):
    inlines = (CalculationRowInline,)
    list_filter = ("application", "application__status", "application__company")
    list_display = (
        "id",
        "start_date",
        "end_date",
        "calculated_benefit_amount",
        "override_benefit_amount",
        "granted_as_de_minimis_aid",
        "target_group_check",
        "created_at",
        "modified_at",
        "__str__",
    )
    search_fields = (
        "id",
        "application__company__id",
        "application__application_number",
        "application__company_name",
        "application__company_contact_person_email",
    )
    date_hierarchy = "created_at"
    ordering = ("-created_at",)


admin.site.register(Calculation, CalculationAdmin)
admin.site.register(PaySubsidy)
admin.site.register(TrainingCompensation)
admin.site.register(PreviousBenefit)
admin.site.register(CalculationRow)
