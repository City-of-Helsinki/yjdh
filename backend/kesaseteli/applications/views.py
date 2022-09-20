from datetime import date
from functools import partial
from typing import Union

import xlsx_streaming
from django.conf import settings
from django.db.models import OuterRef, QuerySet, Subquery, Window
from django.db.models.functions import RowNumber
from django.http import HttpResponseRedirect, StreamingHttpResponse
from django.shortcuts import render
from django.utils.translation import gettext_lazy as _
from django.views.generic.base import TemplateView

from applications.enums import EmployerApplicationStatus, ExcelColumns
from applications.exporters.excel_exporter import (
    generate_data_rows,
    generate_xlsx_template,
    get_exportable_fields,
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

    @staticmethod
    def base_queryset(filter_pks=None) -> QuerySet[EmployerSummerVoucher]:
        newest_submitted = EmployerSummerVoucher.history.filter(
            id=OuterRef("id"), application__status=EmployerApplicationStatus.SUBMITTED
        ).order_by("-modified_at")
        base_queryset = EmployerSummerVoucher.objects
        if filter_pks:
            base_queryset.filter(pk__in=filter_pks)
        return (
            base_queryset.select_related(
                "application", "application__company", "application__user"
            )
            .prefetch_related("attachments")
            .annotate(submitted_at=Subquery(newest_submitted.values("modified_at")[:1]))
            .order_by("submitted_at")
            .annotate(row_number=Window(expression=RowNumber()))
        )

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

    def get_xlsx_response(
        self, queryset: QuerySet[EmployerSummerVoucher], columns: ExcelColumns
    ) -> StreamingHttpResponse:
        """
        Generate a StreamingHttpResponse with an xlsx attachment.
        """
        serializer = partial(
            generate_data_rows,
            fields=get_exportable_fields(columns),
            request=self.request,
        )
        response = StreamingHttpResponse(
            xlsx_streaming.stream_queryset_as_xlsx(
                qs=queryset,
                xlsx_template=generate_xlsx_template(queryset, columns, self.request),
                serializer=serializer,
                batch_size=settings.EXCEL_DOWNLOAD_BATCH_SIZE,
            ),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = "attachment; filename={}".format(
            get_xlsx_filename(columns)
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
    ) -> Union[StreamingHttpResponse, HttpResponseRedirect]:
        """
        Export unhandled applications and redirect back to the excel download page.
        The user will see a new xlsx file generated in the generated files list.
        """
        queryset_without_pks = self.base_queryset().filter(
            is_exported=False,
            application__status=EmployerApplicationStatus.SUBMITTED,
        )
        # Evaluate the source set's primary keys so that we know the set at this point
        queryset_pks = set(queryset_without_pks.values_list("pk", flat=True))

        if not queryset_pks:
            return self.render_error(_("Ei uusia käsittelemättömiä hakemuksia."))

        # Make a queryset which should evaluate to the same queryset as
        # queryset_without_pks but without any condition related to is_exported field.
        #
        # This is done this way because the queryset's results are streamed and thus
        # not guaranteed to be evaluated before the update query in this function which
        # sets the source set's is_exported values to True.
        queryset_with_pks = self.base_queryset(filter_pks=queryset_pks).filter(
            application__status=EmployerApplicationStatus.SUBMITTED
        )

        response = self.get_xlsx_response(queryset_with_pks, columns)
        # Clear order_by to avoid errors
        # NOTE: This update query may get evaluated before results have been streamed!
        queryset_with_pks.order_by().update(is_exported=True)
        return response

    def export_and_download_annual_applications(
        self, columns: ExcelColumns
    ) -> Union[StreamingHttpResponse, HttpResponseRedirect]:
        """
        Export all applications from the ongoing year to xlsx file and download the file.
        The file is returned as a response, thus automatically downloaded. The genearted xlsx
        file will not be saved on disk and will not be shown on the xlsx files list.
        """
        start_of_year = date(date.today().year, 1, 1)
        queryset = (
            self.base_queryset()
            .filter(
                application__created_at__gte=start_of_year,
            )
            .exclude(application__status=EmployerApplicationStatus.DRAFT)
        )
        if not queryset.exists():
            return self.render_error(_("Hakemuksia ei löytynyt."))

        return self.get_xlsx_response(queryset, columns)
