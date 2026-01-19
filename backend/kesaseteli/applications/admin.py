import logging
from itertools import chain

from django import forms
from django.apps import apps
from django.conf import settings
from django.contrib import admin
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import path, reverse
from django.utils import timezone
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _
from django.utils.translation import ngettext

from applications.models import (
    EmailTemplate,
    EmployerApplication,
    EmployerSummerVoucher,
    School,
    SummerVoucherConfiguration,
    YouthApplication,
    YouthSummerVoucher,
)
from applications.services import EmailTemplateService
from applications.target_groups import get_target_group_choices
from common.utils import mask_social_security_number

TARGET_GROUP_CHOICES_DICT = dict(get_target_group_choices())

LOGGER = logging.getLogger(__name__)


class SummerVoucherConfigurationAdminForm(forms.ModelForm):
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
            str(TARGET_GROUP_CHOICES_DICT.get(group_identifier, group_identifier))
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


class EmailTemplateAdmin(admin.ModelAdmin):
    list_display = ["type", "language", "subject", "modified_at"]
    list_filter = ["type", "language"]
    search_fields = ["subject", "html_body", "text_body"]
    readonly_fields = [
        "text_body",
        "created_at",
        "modified_at",
    ]
    actions = ["reinitialize_from_file", "send_to_me"]
    change_list_template = "admin/applications/emailtemplate/change_list.html"
    change_form_template = "admin/applications/emailtemplate/change_form.html"

    def get_urls(self):
        urls = super().get_urls()
        my_urls = [
            # Custom URL for ensuring templates exist
            path(
                "ensure-templates/",
                self.admin_site.admin_view(self.ensure_templates_view),
                name="ensure-templates",
            ),
            path(
                "<path:object_id>/preview/",
                self.admin_site.admin_view(self.preview_email_view),
                name="applications_emailtemplate_preview",
            ),
        ]
        return my_urls + urls

    def ensure_templates_view(self, request):
        """Create missing email templates."""
        count = EmailTemplateService.ensure_templates_exist()
        if count > 0:
            self.message_user(
                request,
                ngettext(
                    "Created {count} missing template.",
                    "Created {count} missing templates.",
                    count,
                ).format(count=count),
            )
        else:
            self.message_user(request, _("All templates already exist."))

        url = reverse("admin:applications_emailtemplate_changelist")
        return HttpResponseRedirect(url)

    def preview_email_view(self, request, object_id):
        template = self.get_object(request, object_id)
        if not template:
            return HttpResponse(_("Template not found"), status=404)

        try:
            rendered = EmailTemplateService.render_template_with_mock_context(template)
            subject = rendered["subject"]
            body = rendered["body"]
        except Exception as e:
            LOGGER.warning(f"Error rendering template: {e}")
            return HttpResponse(_("Error rendering template"), status=500)

        return render(
            request,
            "admin/applications/emailtemplate/preview.html",
            {
                "subject": subject,
                "body": body,
                "template_type": template.get_type_display(),
                "language": template.get_language_display(),
            },
        )

    @admin.action(description=_("Send selected email templates to me"))
    def send_to_me(self, request, queryset):
        """Send selected email templates to the current user's email."""
        if not request.user.email:
            self.message_user(
                request,
                _("You do not have an email address configured."),
                level="ERROR",
            )
            return

        success_count = 0
        failure_count = 0

        for template in queryset:
            try:
                sent = EmailTemplateService.send_template_preview_to_email(
                    template, request.user.email
                )
                if sent:
                    success_count += 1
                else:
                    failure_count += 1
            except Exception as e:
                failure_count += 1
                self.message_user(
                    request,
                    _("Error rendering template {template}: {e}").format(
                        template=template, e=e
                    ),
                    level="ERROR",
                )

        if success_count > 0:
            self.message_user(
                request,
                ngettext(
                    "Successfully sent {count} email to {email}.",
                    "Successfully sent {count} emails to {email}.",
                    success_count,
                ).format(count=success_count, email=request.user.email),
            )
        if failure_count > 0:
            self.message_user(
                request,
                ngettext(
                    "Failed to send {count} email.",
                    "Failed to send {count} emails.",
                    failure_count,
                ).format(count=failure_count),
                level="ERROR",
            )

    @admin.action(description=_("Reinitialize selected templates from file"))
    def reinitialize_from_file(self, request, queryset):
        """Reinitialize selected templates from file."""
        success_count = 0
        for template in queryset:
            if EmailTemplateService.reinitialize_from_file(template):
                success_count += 1

        self.message_user(
            request,
            ngettext(
                "Reinitialized {count} template.",
                "Reinitialized {count} templates.",
                success_count,
            ).format(count=success_count),
        )


class SchoolFilter(admin.SimpleListFilter):
    title = _("school")
    parameter_name = "school"

    def lookups(self, request, model_admin):
        schools = School.objects.values_list("name", flat=True).order_by("name")
        return [(school, school) for school in schools]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(school=self.value())
        return queryset


class IsValidSchoolFilter(admin.SimpleListFilter):
    title = _("is in school list")
    parameter_name = "is_valid_school"

    def lookups(self, request, model_admin):
        return (
            ("yes", _("Yes")),
            ("no", _("No")),
        )

    def queryset(self, request, queryset):
        if self.value() == "yes":
            return queryset.filter(
                school__in=School.objects.values_list("name", flat=True)
            )
        if self.value() == "no":
            return queryset.exclude(
                school__in=School.objects.values_list("name", flat=True)
            )
        return queryset


class YouthApplicationAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "first_name",
        "last_name",
        "masked_social_security_number",
        "status",
        "school",
        "is_valid_school",
        "created_at",
        "modified_at",
    ]
    list_filter = [
        "created_at",
        "modified_at",
        "status",
        IsValidSchoolFilter,
        SchoolFilter,
    ]
    date_hierarchy = "created_at"
    search_fields = [
        "id",
        "first_name",
        "last_name",
        "school",
    ]

    # A custom field to list contact info fields
    # This is used to determine which fields should be readonly
    contact_info_fields = [
        "first_name",
        "last_name",
        "email",
        "phone_number",
        "postcode",
        "school",
        "is_unlisted_school",
        "language",
    ]

    def is_valid_school(self, obj):
        return School.objects.filter(name=obj.school).exists()

    is_valid_school.boolean = True
    # The school list changes in time, so we can test only whether the value is
    # currently in school list.
    is_valid_school.short_description = _("is in current school list")

    def masked_social_security_number(self, obj):
        """Mask social security number for display."""
        return mask_social_security_number(obj.social_security_number)

    masked_social_security_number.short_description = _("social security number")

    def get_readonly_fields(self, request, obj=None):
        """Make contact info fields readonly."""
        if obj:
            return [
                f.name
                for f in self.model._meta.fields
                if f.name not in self.contact_info_fields
            ]
        return super().get_readonly_fields(request, obj)

    def has_add_permission(self, request):
        """Disable adding new applications."""
        return False

    def has_delete_permission(self, request, obj=None):
        """Disable deleting applications."""
        return False


class YouthSummerVoucherAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "summer_voucher_serial_number",
        "target_group",
        "youth_application_link",
        "masked_social_security_number",
        "youth_application__email",
        "youth_application__phone_number",
        "created_at",
        "modified_at",
    ]
    list_filter = [
        "target_group",
        "created_at",
        "modified_at",
    ]
    date_hierarchy = "created_at"
    search_fields = [
        "youth_application__first_name",
        "youth_application__last_name",
        "youth_application__email",
        "youth_application__phone_number",
        "summer_voucher_serial_number",
        "id",
    ]
    autocomplete_fields = [
        "youth_application",
    ]
    actions = ["resend_voucher"]

    def queryset(self, request):
        return super().queryset(request).select_related("youth_application")

    def masked_social_security_number(self, obj):
        """Mask social security number for display."""
        return mask_social_security_number(obj.youth_application.social_security_number)

    masked_social_security_number.short_description = _("social security number")

    def youth_application_link(self, obj):
        url = reverse(
            "admin:applications_youthapplication_change",
            args=[obj.youth_application.id],
        )
        link_text = obj.youth_application.name or obj.youth_application.email
        return mark_safe(f'<a href="{url}">{link_text}</a>')

    youth_application_link.short_description = _("youth application")

    @admin.action(
        description=_("Resend summer voucher to selected applicants and to the handler")
    )
    def resend_voucher(self, request, queryset):
        sent_count = 0
        failed_count = 0
        for youth_summer_voucher in queryset:
            if youth_summer_voucher.send_youth_summer_voucher_email(
                language=youth_summer_voucher.youth_application.language
            ):
                sent_count += 1
            else:
                failed_count += 1

        if sent_count > 0:
            self.message_user(
                request,
                ngettext(
                    "Resent summer voucher to {count} applicant.",
                    "Resent summer voucher to {count} applicants.",
                    sent_count,
                ).format(count=sent_count),
                level=logging.INFO,
            )

        if failed_count > 0:
            self.message_user(
                request,
                ngettext(
                    "Failed to resend summer voucher to {count} applicant.",
                    "Failed to resend summer voucher to {count} applicants.",
                    failed_count,
                ).format(count=failed_count),
                level=logging.ERROR,
            )


class EmployerApplicationAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "company__name",
        "status",
        "user__first_name",
        "user__last_name",
        "created_at",
        "modified_at",
    ]
    list_filter = [
        "status",
        "created_at",
        "modified_at",
    ]
    date_hierarchy = "created_at"
    search_fields = [
        "company__name",
        "id",
        "user__first_name",
        "user__last_name",
    ]
    autocomplete_fields = ["company", "user"]
    readonly_fields = [
        "company",
        "user",
        "created_at",
        "modified_at",
    ]

    def has_add_permission(self, request):
        """Disable adding new applications."""
        return False

    def has_delete_permission(self, request, obj=None):
        """Disable deleting applications."""
        return False

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("company")
            .select_related("user")
        )


class EmployerSummerVoucherAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "summer_voucher_serial_number",
        "target_group",
        "application__company__name",
        "created_at",
        "modified_at",
    ]
    list_filter = [
        "target_group",
        "created_at",
        "modified_at",
    ]
    date_hierarchy = "created_at"
    search_fields = [
        "summer_voucher_serial_number",
        "id",
        "application__company__name",
    ]
    autocomplete_fields = ["application"]
    readonly_fields = [
        "summer_voucher_serial_number",
        "target_group",
        "application",
        "masked_employee_ssn",
        "created_at",
        "modified_at",
    ]
    exclude = ["employee_ssn"]

    # custom property to list employee related fields.
    employee_fields = [
        "masked_employee_ssn",
        "employee_name",
        "employee_school",
        "employee_phone_number",
        "employee_home_city",
        "employee_postcode",
    ]
    # custom property to list timestamp base model fields
    time_fields = ["created_at", "modified_at"]

    def get_fieldsets(self, request, obj=None):
        """
        Custom fieldsets to group fields.

        This method groups fields into three sections:
        1. First section: All fields that are not excluded, employee related,
        or timestamp related.
        2. Employee section: All employee related fields.
        3. Timestamp section: All timestamp related fields.
        """
        admin_fields = self.get_fields(request, obj)
        first_section_fields = [
            field
            for field in admin_fields
            if field
            not in list(chain(self.exclude, self.employee_fields, self.time_fields))
        ]
        return [
            (
                None,
                {"fields": first_section_fields},
            ),
            (_("Employee"), {"fields": self.employee_fields}),
            (_("Timestamps"), {"fields": self.time_fields}),
        ]

    def has_add_permission(self, request):
        """Disable adding new employer summer vouchers."""
        return False

    def has_delete_permission(self, request, obj=None):
        """Disable deleting employer summer vouchers."""
        return False

    def queryset(self, request):
        return (
            super()
            .queryset(request)
            .select_related("application")
            .select_related("application__company")
        )

    def masked_employee_ssn(self, obj):
        """Mask employee social security number for display."""
        return mask_social_security_number(obj.employee_ssn)

    masked_employee_ssn.short_description = _("employee social security number")


if apps.is_installed("django.contrib.admin"):
    admin.site.register(SummerVoucherConfiguration, SummerVoucherConfigurationAdmin)
    admin.site.register(School, SchoolAdmin)
    admin.site.register(EmailTemplate, EmailTemplateAdmin)
    admin.site.register(YouthApplication, YouthApplicationAdmin)
    admin.site.register(YouthSummerVoucher, YouthSummerVoucherAdmin)
    admin.site.register(EmployerApplication, EmployerApplicationAdmin)
    admin.site.register(EmployerSummerVoucher, EmployerSummerVoucherAdmin)
