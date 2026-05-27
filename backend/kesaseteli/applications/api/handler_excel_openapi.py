"""OpenAPI schema for handler Excel export endpoints (see handler_excel_views)."""

from drf_spectacular.utils import (
    extend_schema,
    extend_schema_view,
    OpenApiParameter,
    OpenApiResponse,
)

from applications.enums import EmployerExcelExportKind, ExcelColumns

_EXCEL_MEDIA_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

_COLUMNS_PARAMETER = OpenApiParameter(
    name="columns",
    type=str,
    enum=list(ExcelColumns.values),
    location=OpenApiParameter.PATH,
    description=(
        "Column layout for the spreadsheet. "
        f"Supported values: {', '.join(ExcelColumns.values)}."
    ),
)

_EXPORT_KIND_PARAMETER = OpenApiParameter(
    name="export_kind",
    type=str,
    enum=list(EmployerExcelExportKind.values),
    location=OpenApiParameter.PATH,
    description=(
        "Export set: unhandled (mark submitted as exported), annual (current year), "
        "or annual-previous (previous calendar year)."
    ),
)

_EXCEL_DOWNLOAD_TAG = "excel-download"

_SPREADSHEET_RESPONSE = OpenApiResponse(
    description="Excel spreadsheet download.",
    response={
        _EXCEL_MEDIA_TYPE: {
            "schema": {"type": "string", "format": "binary"},
        }
    },
)

_AUTH_DESCRIPTION = (
    "Requires an authenticated handler session (ADFS). "
    "Unauthenticated browser requests are redirected to login."
)


# drf-spectacular only: documents ReDoc/Swagger, no request handling or validation.
openapi_employer_excel_export_schema = extend_schema(
    tags=[_EXCEL_DOWNLOAD_TAG],
    description=(
        f"Download employer summer voucher applications as Excel. {_AUTH_DESCRIPTION}"
    ),
    parameters=[_EXPORT_KIND_PARAMETER, _COLUMNS_PARAMETER],
    responses={
        200: _SPREADSHEET_RESPONSE,
        400: OpenApiResponse(description="Invalid export kind or columns value."),
        401: OpenApiResponse(description="Authentication required."),
        403: OpenApiResponse(description="Handler permission required."),
    },
)

openapi_youth_excel_export_viewset_schema = extend_schema_view(
    create=extend_schema(exclude=True),
    retrieve=extend_schema(exclude=True),
    update=extend_schema(exclude=True),
    partial_update=extend_schema(exclude=True),
    destroy=extend_schema(exclude=True),
    list=extend_schema(
        tags=[_EXCEL_DOWNLOAD_TAG],
        description=(
            "Download all active confirmed youth summer voucher applications as Excel. "
            f"{_AUTH_DESCRIPTION}"
        ),
        responses={
            200: _SPREADSHEET_RESPONSE,
            401: OpenApiResponse(description="Authentication required."),
            403: OpenApiResponse(description="Handler permission required."),
        },
    ),
)
