from datetime import date

from django.db.models import OuterRef, Subquery
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.utils.translation import gettext_lazy as _
from django.views.generic.base import TemplateView

from applications.enums import EmployerApplicationStatus, ExcelColumns
from applications.exporters.excel_exporter import (
    export_applications_as_xlsx_output,
    get_xlsx_filename,
)
from applications.models import EmployerSummerVoucher
from common.decorators import enforce_handler_view_adfs_login


class EmployerApplicationExcelDownloadView(TemplateView):
    """
    TODO: This should be removed after the actual controller UI is implemented.
    This is a temporary view implemented by Django for MVP purposes. Basically it provides
    a very simple view for the controllers to export the applications as Excel files.
    """

    template_name = "application_excel_download.html"

    @enforce_handler_view_adfs_login
    def get(self, request, *args, **kwargs):
        columns = request.GET.get("columns", ExcelColumns.REPORTING.value)
        if columns not in ExcelColumns.values:
            raise ValueError(
                f"Invalid columns {columns} for Excel download, "
                f"acceptable values are {ExcelColumns.values}"
            )

        if request.GET.get("download") == "unhandled":
            return self.export_and_download_unhandled_applications(columns)
        elif request.GET.get("download") == "annual":
            return self.export_and_download_annual_applications(columns)
        else:
            return super().get(request, *args, **kwargs)

    def get_xlsx_response(self, queryset, columns: ExcelColumns) -> HttpResponse:
        """
        Generate a HttpResponse with an xlsx attachment.
        """
        filename = get_xlsx_filename(columns)
        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = "attachment; filename=%s" % filename
        response.content = export_applications_as_xlsx_output(
            queryset, columns, self.request
        )
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

    def export_and_download_unhandled_applications(
        self, columns: ExcelColumns
    ) -> HttpResponse:
        """
        Export unhandled applications and redirect back to the excel download page.
        The user will see a new xlsx file generated in the generated files list.
        """
        newest_submitted = EmployerSummerVoucher.history.filter(
            id=OuterRef("id"), application__status=EmployerApplicationStatus.SUBMITTED
        ).order_by("-modified_at")
        queryset = (
            EmployerSummerVoucher.objects.select_related(
                "application", "application__company"
            )
            .filter(
                is_exported=False,
                application__status=EmployerApplicationStatus.SUBMITTED,
            )
            .annotate(submitted_at=Subquery(newest_submitted.values("modified_at")[:1]))
            .order_by("submitted_at")
        )
        if not queryset.exists():
            return self.render_error(_("Ei uusia käsittelemättömiä hakemuksia."))

        response = self.get_xlsx_response(queryset, columns)
        # Clear order_by to avoid errors
        queryset.order_by().update(is_exported=True)
        return response

    def export_and_download_annual_applications(
        self, columns: ExcelColumns
    ) -> HttpResponse:
        """
        Export all applications from the ongoing year to xlsx file and download the file.
        The file is returned as a response, thus automatically downloaded. The genearted xlsx
        file will not be saved on disk and will not be shown on the xlsx files list.
        """
        start_of_year = date(date.today().year, 1, 1)
        newest_submitted = EmployerSummerVoucher.history.filter(
            id=OuterRef("id"), application__status=EmployerApplicationStatus.SUBMITTED
        ).order_by("-modified_at")
        queryset = (
            EmployerSummerVoucher.objects.select_related(
                "application", "application__company"
            )
            .filter(
                application__created_at__gte=start_of_year,
            )
            .exclude(application__status=EmployerApplicationStatus.DRAFT)
            .annotate(submitted_at=Subquery(newest_submitted.values("modified_at")[:1]))
            .order_by("submitted_at")
        )
        if not queryset.exists():
            return self.render_error(_("Hakemuksia ei löytynyt."))

        return self.get_xlsx_response(queryset, columns)
