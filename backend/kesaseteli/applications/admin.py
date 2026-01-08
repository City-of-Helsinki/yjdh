from django import forms
from django.apps import apps
from django.conf import settings
from django.contrib import admin
from django.utils import timezone

from applications.enums import AdditionalInfoUserReason
from applications.models import School, SummerVoucherConfiguration
from applications.target_groups import get_target_group_choices

target_group_choices_dict = dict(get_target_group_choices())


class SummerVoucherConfigurationAdminForm(forms.ModelForm):
    additional_info_user_reasons = forms.MultipleChoiceField(
        choices=AdditionalInfoUserReason.choices,
        widget=forms.CheckboxSelectMultiple,
        required=False,
    )

    target_group = forms.MultipleChoiceField(
        choices=get_target_group_choices(),
        widget=forms.CheckboxSelectMultiple,
        required=True,
    )

    class Meta:
        model = SummerVoucherConfiguration
        fields = "__all__"


class TargetGroupFilter(admin.SimpleListFilter):
    title = "target group"
    parameter_name = "target_group"

    def lookups(self, _request, _model_admin):
        return get_target_group_choices()

    def queryset(self, _request, queryset):
        value = self.value()
        if value:
            return queryset.filter(target_group__contains=[value])
        return queryset


class SummerVoucherConfigurationAdmin(admin.ModelAdmin):
    form = SummerVoucherConfigurationAdminForm
    list_display = [
        "year",
        "get_target_group_names",
        "voucher_value_in_euros",
        "min_work_compensation_in_euros",
        "min_work_hours",
    ]
    list_filter = [
        "year",
        TargetGroupFilter,
    ]
    fieldsets = [
        (
            None,
            {
                "fields": (
                    "year",
                    "target_group",
                    "voucher_value_in_euros",
                    "min_work_compensation_in_euros",
                    "min_work_hours",
                )
            },
        )
    ]

    def get_target_group_names(self, obj):
        return ", ".join(
            str(target_group_choices_dict.get(group_identifier, group_identifier))
            for group_identifier in obj.target_group
        )

    get_target_group_names.short_description = "Target Group"

    def get_changeform_initial_data(self, request):
        return {
            "year": timezone.now().year,
            "voucher_value_in_euros": settings.SUMMER_VOUCHER_DEFAULT_VOUCHER_VALUE,
            "min_work_compensation_in_euros": (
                settings.SUMMER_VOUCHER_DEFAULT_MIN_WORK_COMPENSATION
            ),
            "min_work_hours": settings.SUMMER_VOUCHER_DEFAULT_MIN_WORK_HOURS,
        }


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
    admin.site.register(SummerVoucherConfiguration, SummerVoucherConfigurationAdmin)
    admin.site.register(School, SchoolAdmin)
