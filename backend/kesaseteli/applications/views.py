"""Django views for handler-facing HTML pages in the applications app."""

from django.utils.decorators import method_decorator
from django.views.generic.base import TemplateView

from applications.employer_excel_export import (
    get_excel_download_error_message,
    parse_excel_download_error_code,
)
from common.decorators import enforce_handler_view_adfs_login
from common.urls import handler_create_application_without_ssn_url


@method_decorator(enforce_handler_view_adfs_login, name="dispatch")
class EmployerExcelDownloadPageView(TemplateView):
    """Handler landing page with forms that link to Excel export endpoints.

    TODO: Remove after the real handler UI exists. Spreadsheet downloads use
    ``applications.api.handler_excel_views`` endpoints documented in OpenAPI.
    """

    template_name = "application_excel_download.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(
            **kwargs,
            handler_create_application_without_ssn_url=handler_create_application_without_ssn_url(),
        )
        error_code = parse_excel_download_error_code(self.request.GET.get("error"))
        if error_code is not None:
            context["error"] = get_excel_download_error_message(error_code)
        return context
