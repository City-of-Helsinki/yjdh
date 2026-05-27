"""Employer summer voucher Excel export logic for handler tools."""

from dataclasses import dataclass
from datetime import date
from functools import partial

import xlsx_streaming
from django.conf import settings
from django.db.models import F, QuerySet, Window
from django.db.models.functions import RowNumber
from django.http import HttpRequest, StreamingHttpResponse
from django.utils.translation import gettext_lazy as _

from applications.enums import (
    EmployerApplicationStatus,
    EmployerExcelExportKind,
    ExcelColumns,
)
from applications.exporters.excel_exporter import (
    generate_data_rows,
    generate_xlsx_template,
    get_exportable_fields,
    get_xlsx_filename,
)
from applications.models import EmployerSummerVoucher


class EmployerExcelExportError(Exception):
    """Invalid export parameters or no rows to export."""

    def __init__(self, message: str, *, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


@dataclass(frozen=True)
class EmployerExcelExportParameters:
    """Validated parameters for an employer Excel export request."""

    export_kind: EmployerExcelExportKind
    columns: ExcelColumns


def parse_export_parameters(
    export_kind: str,
    columns: str,
) -> EmployerExcelExportParameters:
    """Validate export kind and column set from the request.

    Args:
        export_kind: Path segment identifying the export type.
        columns: Path segment identifying the column layout (reporting or talpa).

    Returns:
        Validated export parameters.

    Raises:
        EmployerExcelExportError: If kind or columns are not supported.
    """
    if export_kind not in EmployerExcelExportKind.values:
        raise EmployerExcelExportError(
            _("Invalid export type. Supported values: %(values)s.")
            % {"values": ", ".join(EmployerExcelExportKind.values)}
        )

    if columns not in ExcelColumns.values:
        raise EmployerExcelExportError(
            _("Invalid columns value. Supported values: %(values)s.")
            % {"values": ", ".join(ExcelColumns.values)}
        )

    return EmployerExcelExportParameters(
        export_kind=EmployerExcelExportKind(export_kind),
        columns=ExcelColumns(columns),
    )


class EmployerExcelExportService:
    """Build employer application Excel exports for handler download endpoints."""

    def __init__(self, request: HttpRequest):
        self.request = request

    @staticmethod
    def base_queryset(filter_pks: set | None = None) -> QuerySet:
        """Queryset for exports with relations loaded and stable row ordering.

        Args:
            filter_pks: Optional primary keys to restrict the export set.

        Returns:
            Employer summer vouchers ready for Excel serialization.
        """
        base_queryset = EmployerSummerVoucher.objects
        if filter_pks is not None:
            base_queryset = base_queryset.filter(pk__in=filter_pks)
        return (
            base_queryset.select_related(
                "application", "application__company", "application__user"
            )
            .prefetch_related("attachments")
            .order_by("application__submitted_at", "created_at", "pk")
            .annotate(
                row_number=Window(
                    expression=RowNumber(),
                    order_by=[F("application__submitted_at"), F("created_at"), F("pk")],
                )
            )
        )

    def build_xlsx_response(
        self,
        queryset: QuerySet,
        columns: ExcelColumns,
    ) -> StreamingHttpResponse:
        """Stream an xlsx attachment for the given queryset.

        Args:
            queryset: Vouchers to include in the export.
            columns: Column layout to use in the spreadsheet.

        Returns:
            Streaming HTTP response with spreadsheet content type.
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
            content_type=(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            ),
        )
        response["Content-Disposition"] = "attachment; filename={}".format(
            get_xlsx_filename(columns)
        )
        return response

    def export(
        self, parameters: EmployerExcelExportParameters
    ) -> StreamingHttpResponse:
        """Run the requested employer export and return a file download.

        Args:
            parameters: Validated export kind and column layout.

        Returns:
            Spreadsheet download response.

        Raises:
            EmployerExcelExportError: If there is nothing to export.
        """
        if parameters.export_kind == EmployerExcelExportKind.UNHANDLED:
            return self._export_unhandled(parameters.columns)
        if parameters.export_kind == EmployerExcelExportKind.ANNUAL:
            return self._export_annual(parameters.columns, year=date.today().year)
        return self._export_annual(
            parameters.columns,
            year=date.today().year - 1,
        )

    def _export_unhandled(self, columns: ExcelColumns) -> StreamingHttpResponse:
        queryset_without_pks = self.base_queryset().filter(
            is_exported=False,
            application__status=EmployerApplicationStatus.SUBMITTED,
        )
        queryset_pks = set(queryset_without_pks.values_list("pk", flat=True))

        if not queryset_pks:
            raise EmployerExcelExportError(_("Ei uusia käsittelemättömiä hakemuksia."))

        queryset_with_pks = self.base_queryset(filter_pks=queryset_pks).filter(
            application__status=EmployerApplicationStatus.SUBMITTED
        )

        response = self.build_xlsx_response(queryset_with_pks, columns)
        queryset_with_pks.order_by().update(is_exported=True)
        return response

    def _export_annual(self, columns: ExcelColumns, year: int) -> StreamingHttpResponse:
        queryset = (
            self.base_queryset()
            .filter(application__created_at__year=year)
            .exclude(application__status=EmployerApplicationStatus.DRAFT)
        )
        if not queryset.exists():
            raise EmployerExcelExportError(_("Hakemuksia ei löytynyt."))

        return self.build_xlsx_response(queryset, columns)
