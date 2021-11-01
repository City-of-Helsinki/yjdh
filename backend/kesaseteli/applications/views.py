from datetime import date

from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import OuterRef, Subquery
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.utils.translation import gettext_lazy as _
from django.views.generic.base import TemplateView

from applications.enums import ApplicationStatus
from applications.exporters.excel_exporter import (
    export_applications_as_xlsx_output,
    get_xlsx_filename,
)
from applications.models import SummerVoucher


@method_decorator(staff_member_required, name="dispatch")
class ApplicationExcelDownloadView(TemplateView):
    """
    TODO: This should be removed after the actual controller UI is implemented.
    This is a temporary view implemented by Django for MVP purposes. Basically it provides
    a very simple view for the controllers to export the applications as Excel files.
    """

    template_name = "application_excel_download.html"

    def get(self, request, *args, **kwargs):
        if request.GET.get("download") == "unhandled":
            return self.export_and_download_unhandled_applications()
        elif request.GET.get("download") == "annual":
            return self.export_and_download_annual_applications()
        else:
            return super().get(request, *args, **kwargs)

    def get_xlsx_response(self, queryset) -> HttpResponse:
        """
        Generate a HttpResponse with an xlsx attachment.
        """
        filename = get_xlsx_filename()
        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = "attachment; filename=%s" % filename
        response.content = export_applications_as_xlsx_output(queryset, self.request)
        return response

    def render_error(self, error) -> HttpResponseRedirect:
        """
        Render given error message.
        """
        context = self.get_context_data()
        context.update({"error": error})
        return render(
            self.request,
            self.template_name,
            context=context,
        )

    def export_and_download_unhandled_applications(self) -> HttpResponse:
        """
        Export unhandled applications and redirect back to the excel download page.
        The user will see a new xlsx file generated in the generated files list.
        """
        newest_submitted = SummerVoucher.history.filter(
            id=OuterRef("id"), application__status=ApplicationStatus.SUBMITTED
        ).order_by("modified_at")
        queryset = (
            SummerVoucher.objects.select_related("application", "application__company")
            .filter(is_exported=False, application__status=ApplicationStatus.SUBMITTED)
            .annotate(submitted_at=Subquery(newest_submitted.values("modified_at")[:1]))
            .order_by("-submitted_at")
        )
        if not queryset.exists():
            return self.render_error(_("Ei uusia käsittelemättömiä hakemuksia."))

        response = self.get_xlsx_response(queryset)
        # Clear order_by to avoid errors
        queryset.order_by().update(is_exported=True)
        return response

    def export_and_download_annual_applications(self) -> HttpResponse:
        """
        Export all applications from the ongoing year to xlsx file and download the file.
        The file is returned as a response, thus automatically downloaded. The genearted xlsx
        file will not be saved on disk and will not be shown on the xlsx files list.
        """
        start_of_year = date(date.today().year, 1, 1)
        newest_submitted = SummerVoucher.history.filter(
            id=OuterRef("id"), application__status=ApplicationStatus.SUBMITTED
        ).order_by("modified_at")
        queryset = (
            SummerVoucher.objects.select_related("application", "application__company")
            .filter(
                application__created_at__gte=start_of_year,
            )
            .exclude(application__status=ApplicationStatus.DRAFT)
            .annotate(submitted_at=Subquery(newest_submitted.values("modified_at")[:1]))
            .order_by("-submitted_at")
        )
        if not queryset.exists():
            return self.render_error(_("Hakemuksia ei löytynyt."))

        return self.get_xlsx_response(queryset)
