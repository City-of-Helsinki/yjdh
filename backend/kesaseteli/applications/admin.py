import logging

from django import forms
from django.apps import apps
from django.conf import settings
from django.contrib import admin
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import path, reverse
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.utils.translation import ngettext

from applications.models import EmailTemplate, School, SummerVoucherConfiguration
from applications.services import EmailTemplateService
from applications.target_groups import get_target_group_choices

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


if apps.is_installed("django.contrib.admin"):
    admin.site.register(SummerVoucherConfiguration, SummerVoucherConfigurationAdmin)
    admin.site.register(School, SchoolAdmin)
    admin.site.register(EmailTemplate, EmailTemplateAdmin)
