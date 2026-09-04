"""Employer summer voucher Excel export logic for handler tools."""

from dataclasses import dataclass
from datetime import date
from functools import partial

import xlsx_streaming
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.db import models, transaction
from django.db.models import QuerySet
from django.http import HttpRequest, HttpResponseRedirect, StreamingHttpResponse
from django.urls import reverse
from django.utils import translation
from django.utils.translation import gettext_lazy as _

from applications.enums import (
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
from applications.services import AuditAccessLogService


class EmployerExcelExportErrorCode(models.TextChoices):
    """
    Stable error codes for employer Excel export failures shown on the landing page.
    """

    NO_UNHANDLED = "no_unhandled"
    NO_APPLICATIONS = "no_applications"
    INVALID_EXPORT_KIND = "invalid_export_kind"
    INVALID_COLUMNS = "invalid_columns"


class EmployerExcelExportError(Exception):
    """Invalid export parameters or no rows to export."""

    def __init__(self, code: EmployerExcelExportErrorCode):
        super().__init__(code.value)
        self.code = code


def get_excel_download_error_message(
    code: EmployerExcelExportErrorCode,
) -> str:
    """Return the handler-facing error message for a landing-page error code.

    Handler Excel tooling is Finnish-only, matching youth export column headers.

    Args:
        code: Parsed allowlisted error code.

    Returns:
        Finnish message shown in the landing page alert.

    Raises:
        ValueError: If code has no mapped message.
    """
    with translation.override("fi"):
        match code:
            case EmployerExcelExportErrorCode.NO_UNHANDLED:
                return str(_("Ei uusia käsittelemättömiä hakemuksia."))
            case EmployerExcelExportErrorCode.NO_APPLICATIONS:
                return str(_("Hakemuksia ei löytynyt."))
            case EmployerExcelExportErrorCode.INVALID_EXPORT_KIND:
                return str(
                    _("Virheellinen vientitapa. Sallitut arvot: %(values)s.")
                    % {"values": ", ".join(EmployerExcelExportKind.values)}
                )
            case EmployerExcelExportErrorCode.INVALID_COLUMNS:
                return str(
                    _("Virheellinen saraketyyppi. Sallitut arvot: %(values)s.")
                    % {"values": ", ".join(ExcelColumns.values)}
                )
            case _:
                raise ValueError(
                    f"Unhandled employer Excel export error code: {code!r}"
                )


def parse_excel_download_error_code(
    value: str | None,
) -> EmployerExcelExportErrorCode | None:
    """Parse a landing-page error query parameter if it matches a known code.

    Args:
        value: Raw error query string value.

    Returns:
        Matching error code, or None for unknown or missing values.
    """
    if not value:
        return None
    try:
        return EmployerExcelExportErrorCode(value)
    except ValueError:
        return None


def excel_download_error_redirect(
    code: EmployerExcelExportErrorCode,
) -> HttpResponseRedirect:
    """Redirect back to the handler Excel landing page with an error code.

    Args:
        code: Allowlisted error code shown after redirect.

    Returns:
        Redirect response to excel-download with ?error=... query parameter.
    """
    return HttpResponseRedirect(f"{reverse('excel-download')}?error={code.value}")


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
        raise EmployerExcelExportError(EmployerExcelExportErrorCode.INVALID_EXPORT_KIND)

    if columns not in ExcelColumns.values:
        raise EmployerExcelExportError(EmployerExcelExportErrorCode.INVALID_COLUMNS)

    return EmployerExcelExportParameters(
        export_kind=EmployerExcelExportKind(export_kind),
        columns=ExcelColumns(columns),
    )


class EmployerExcelExportService:
    """Build employer application Excel exports for handler download endpoints."""

    def __init__(self, request: HttpRequest):
        self.request = request

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
        """Export all not-yet-exported SUBMITTED vouchers as a spreadsheet.

        Uses a two-phase approach to avoid both a streaming race condition and a
        concurrency race between competing handler requests:

        Phase 1 (inside ``transaction.atomic``): lock the unhandled rows with
        ``select_for_update(skip_locked=True)``, write the audit entry, and mark
        them as exported — all in one atomic operation.  A concurrent request
        that arrives while the lock is held will see zero rows and raise
        ``EmployerExcelExportError(NO_UNHANDLED)`` rather than waiting, which
        prevents two handlers from ever receiving the same batch.

        Phase 2 (outside the transaction): build the streaming queryset using
        ``pk__in`` so the XLSX generation is unaffected by ``is_exported``
        already being ``True`` on those rows.

        Args:
            columns: Column layout to include in the spreadsheet.

        Returns:
            Streaming spreadsheet response.

        Raises:
            EmployerExcelExportError: If there are no unhandled vouchers.
        """
        with transaction.atomic():
            # Lock unhandled rows; skip any already locked by a concurrent request.
            locked_pks = list(
                EmployerSummerVoucher.objects.unhandled()
                .select_for_update(skip_locked=True)
                .values_list("pk", flat=True)
            )
            if not locked_pks:
                raise EmployerExcelExportError(
                    EmployerExcelExportErrorCode.NO_UNHANDLED
                )

            AuditAccessLogService.create_access_log_entry_with_no_related_object_instance(  # noqa: E501
                actor=self.request.user,
                actor_email=getattr(self.request.user, "email", ""),
                content_type=ContentType.objects.get_for_model(EmployerSummerVoucher),
                additional_data={
                    "method": f"{self.__class__.__name__}._export_unhandled",
                    "ids": [str(pk) for pk in locked_pks],
                },
            )

            EmployerSummerVoucher.objects.filter(pk__in=locked_pks).update(
                is_exported=True
            )

        # Transaction committed: PKs are claimed and locks released.
        # Build the stream queryset here — pk__in is unaffected by is_exported.
        queryset = EmployerSummerVoucher.objects.filter(pk__in=locked_pks).for_export()
        return self.build_xlsx_response(queryset, columns)

    def _export_annual(self, columns: ExcelColumns, year: int) -> StreamingHttpResponse:
        """Export all non-DRAFT vouchers for the given calendar year.

        Args:
            columns: Column layout to include in the spreadsheet.
            year: Calendar year to export (e.g. 2026).

        Returns:
            Streaming spreadsheet response.

        Raises:
            EmployerExcelExportError: If no vouchers exist for the year.
        """
        queryset = EmployerSummerVoucher.objects.annual(year).for_export()
        if not queryset.exists():
            raise EmployerExcelExportError(EmployerExcelExportErrorCode.NO_APPLICATIONS)
        return self.build_xlsx_response(queryset, columns)
