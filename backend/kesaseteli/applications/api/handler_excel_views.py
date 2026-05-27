"""DRF views for handler Excel exports"""

import collections
import io

import xlsx_streaming
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.http import HttpResponse, StreamingHttpResponse
from django.utils import timezone, translation
from django.utils.decorators import method_decorator
from django.utils.translation import gettext_lazy as _
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from xlsxwriter import Workbook
from xlsxwriter.worksheet import Format, Worksheet

from applications.api.handler_excel_openapi import (
    openapi_employer_excel_export_schema,
    openapi_youth_excel_export_viewset_schema,
)
from applications.api.v1.serializers import YouthApplicationExcelExportSerializer
from applications.employer_excel_export import (
    EmployerExcelExportError,
    EmployerExcelExportService,
    parse_export_parameters,
)
from applications.models import EmployerSummerVoucher, YouthApplication
from applications.services import AuditAccessLogService
from common.decorators import enforce_handler_view_adfs_login


@method_decorator(enforce_handler_view_adfs_login, name="dispatch")
class EmployerApplicationExcelExportView(APIView):
    """Handler Excel download for employer applications (one export kind per URL)."""

    http_method_names = ["get", "head", "options"]
    permission_classes = [AllowAny]

    @openapi_employer_excel_export_schema
    def get(
        self,
        request: Request,
        export_kind: str,
        columns: str,
    ) -> HttpResponse:
        """Validate input, audit-log access, and stream the spreadsheet.

        Args:
            request: Incoming HTTP request.
            export_kind: Export set from the URL path (unhandled, annual, etc.).
            columns: Column layout from the URL path (reporting or talpa).

        Returns:
            Spreadsheet download or plain-text error response.
        """
        try:
            parameters = parse_export_parameters(export_kind, columns)
        except EmployerExcelExportError as error:
            return HttpResponse(error.message, status=error.status_code)

        AuditAccessLogService.create_access_log_entry_with_no_related_object_instance(
            actor=request.user,
            actor_email=request.user.email,
            content_type=ContentType.objects.get_for_model(EmployerSummerVoucher),
            additional_data={
                "method": f"{self.__class__.__name__}.get",
                "parameters": {
                    "columns": parameters.columns.value,
                    "export_kind": parameters.export_kind.value,
                },
            },
        )

        service = EmployerExcelExportService(request)
        try:
            return service.export(parameters)
        except EmployerExcelExportError as error:
            return HttpResponse(error.message, status=error.status_code)


@openapi_youth_excel_export_viewset_schema
class YouthApplicationExcelExportViewSet(ModelViewSet):
    permission_classes = [AllowAny]  # Permissions are handled per function
    serializer_class = YouthApplicationExcelExportSerializer

    def create(self, request, *args, **kwargs):
        return HttpResponse(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def retrieve(self, request, *args, **kwargs):
        return HttpResponse(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def destroy(self, request, *args, **kwargs):
        return HttpResponse(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def partial_update(self, request, *args, **kwargs):
        return HttpResponse(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def update(self, request, *args, **kwargs):
        return HttpResponse(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @classmethod
    def source_fields_and_output_names(cls) -> collections.OrderedDict:
        with translation.override("fi"):
            return collections.OrderedDict(
                [
                    ("application_date", str(_("Hakupvm"))),
                    ("id", str(_("Tunniste"))),
                    ("status", str(_("Hakemuksen tila"))),
                    ("application_year", str(_("Hakuvuosi"))),
                    ("summer_voucher_serial_number", str(_("Kesäsetelinro"))),
                    ("birth_year", str(_("Syntymävuosi"))),
                    ("birthdate", str(_("Syntymäpvm"))),
                    ("first_name", str(_("Etunimi"))),
                    ("last_name", str(_("Sukunimi"))),
                    ("vtj_last_name", str(_("VTJ-sukunimi"))),
                    ("school", str(_("Koulu"))),
                    ("is_unlisted_school", str(_("Listaamaton koulu?"))),
                    ("email", str(_("Sähköposti"))),
                    ("phone_number", str(_("Puhelinnro"))),
                    ("postcode", str(_("Postinro"))),
                    ("vtj_home_municipality", str(_("VTJ-kotikunta"))),
                    ("additional_info_user_reasons", str(_("Lisätietosyyt"))),
                    ("additional_info_description", str(_("Lisätiedot"))),
                    ("language", str(_("Kieli"))),
                    ("confirmation_date", str(_("Vahvistettu"))),
                    ("additional_info_providing_date", str(_("Lisätiedot annettu"))),
                    ("handling_date", str(_("Käsitelty"))),
                ]
            )

    @classmethod
    def source_fields(cls) -> list:
        return list(cls.source_fields_and_output_names().keys())

    @classmethod
    def output_column_names(cls) -> list:
        return list(cls.source_fields_and_output_names().values())

    def get_queryset(self):
        return YouthApplication.objects.active().order_by("created_at", "pk")

    def serializer(self, apps):
        return (self.generate_data_row(app) for app in apps)

    @enforce_handler_view_adfs_login
    def list(self, request, *args, **kwargs):
        AuditAccessLogService.create_access_log_entry_with_no_related_object_instance(
            actor=request.user,
            actor_email=request.user.email,
            content_type=ContentType.objects.get_for_model(YouthApplication),
            additional_data={"method": f"{self.__class__.__name__}.list"},
        )

        queryset = self.get_queryset()
        if not queryset.exists():
            return HttpResponse(_("Hakemuksia ei löytynyt."))

        response = StreamingHttpResponse(
            xlsx_streaming.stream_queryset_as_xlsx(
                qs=queryset,
                xlsx_template=self.xlsx_template(queryset),
                serializer=self.serializer,
                batch_size=settings.EXCEL_DOWNLOAD_BATCH_SIZE,
            ),
            content_type=(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            ),
        )
        response["Content-Disposition"] = f"attachment; filename={self.xlsx_filename}"
        return response

    @property
    def worksheet_name(self) -> str:
        return str(_("Nuorten kesäsetelihakemukset"))

    @property
    def header_format_properties(self):
        return {"bold": True, "text_wrap": False}

    @property
    def xlsx_filename(self) -> str:
        return f"{self.worksheet_name}-{timezone.localdate()}.xlsx"

    def generate_data_row(self, app: YouthApplication, is_template: bool = False):
        data = self.serializer_class(app).data
        return [
            (
                YouthApplicationExcelExportSerializer.get_placeholder_value(
                    source_field
                )
                if is_template and not data.get(source_field)
                else data.get(source_field)
            )
            for source_field in self.source_fields()
        ]

    def write_data_row(
        self,
        worksheet: Worksheet,
        row_number: int,
        app: YouthApplication,
        is_template: bool = False,
    ):
        data_row = self.generate_data_row(app, is_template)
        for column_number, cell_value in enumerate(data_row):
            worksheet.write(row_number, column_number, cell_value)

    def write_header(self, worksheet: Worksheet, header_format: Format):
        for column_number, column_name in enumerate(self.output_column_names()):
            worksheet.write(0, column_number, column_name, header_format)

    def xlsx_template(self, queryset):
        result = io.BytesIO()
        workbook = Workbook(result)
        worksheet = workbook.add_worksheet(self.worksheet_name)
        header_format = workbook.add_format(self.header_format_properties)
        self.write_header(worksheet, header_format)
        self.write_data_row(
            worksheet=worksheet, row_number=1, app=queryset[0], is_template=True
        )
        workbook.close()
        return result
