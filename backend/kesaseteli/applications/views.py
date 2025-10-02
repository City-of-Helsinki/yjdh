import collections
import io
import typing
from datetime import date
from functools import partial
from typing import List, Union

import xlsx_streaming
from django.conf import settings
from django.db.models import F, OuterRef, QuerySet, Subquery, Window
from django.db.models.functions import RowNumber
from django.http import HttpResponse, HttpResponseRedirect, StreamingHttpResponse
from django.shortcuts import render
from django.utils import timezone, translation
from django.utils.translation import gettext_lazy as _
from django.views.generic.base import TemplateView
from rest_framework import status
from rest_framework.permissions import AllowAny
from xlsxwriter import Workbook
from xlsxwriter.worksheet import Format, Worksheet

from applications.api.v1.serializers import YouthApplicationExcelExportSerializer
from applications.enums import EmployerApplicationStatus, ExcelColumns
from applications.exporters.excel_exporter import (
    generate_data_rows,
    generate_xlsx_template,
    get_exportable_fields,
    get_xlsx_filename,
)
from applications.models import EmployerSummerVoucher, YouthApplication
from common.decorators import enforce_handler_view_adfs_login
from common.urls import handler_create_application_without_ssn_url
from shared.audit_log.viewsets import AuditLoggingModelViewSet


class EmployerApplicationExcelDownloadView(TemplateView):
    """
    TODO: This should be removed after the actual controller UI is implemented.
    This is a temporary view implemented by Django for MVP purposes. Basically it provides
    a very simple view for the controllers to export the applications as Excel files.
    """

    template_name = "application_excel_download.html"

    def get_context_data(self, **kwargs):
        return super().get_context_data(
            **kwargs,
            handler_create_application_without_ssn_url=handler_create_application_without_ssn_url(),
        )

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
            # Use created_at and primary key as the secondary and tertiary ordering
            # parameters to force a predictable although slightly arbitrary ordering for
            # queryset rows with identical submitted_at values.
            .order_by("submitted_at", "created_at", "pk")
            .annotate(
                row_number=Window(
                    expression=RowNumber(),
                    order_by=[F("submitted_at"), F("created_at"), F("pk")],
                )
            )
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
            return self.export_and_download_annual_applications(
                columns, year=date.today().year
            )
        elif request.GET.get("download") == "annual-previous":
            return self.export_and_download_annual_applications(
                columns, year=date.today().year - 1
            )
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

    def render_error(self, error) -> HttpResponse:
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
        self, columns: ExcelColumns, year: int
    ) -> Union[StreamingHttpResponse, HttpResponseRedirect]:
        """
        Export all applications from the given year to xlsx file and download the file.
        The file is returned as a response, thus automatically downloaded. The generated
        xlsx file will not be saved on disk and will not be shown on the xlsx files list.
        """
        queryset = (
            self.base_queryset()
            .filter(application__created_at__year=year)
            .exclude(application__status=EmployerApplicationStatus.DRAFT)
        )
        if not queryset.exists():
            return self.render_error(_("Hakemuksia ei löytynyt."))

        return self.get_xlsx_response(queryset, columns)


class YouthApplicationExcelExportViewSet(AuditLoggingModelViewSet):
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
    def source_fields_and_output_names(cls) -> typing.OrderedDict[str, str]:
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
    def source_fields(cls) -> List[str]:
        return list(cls.source_fields_and_output_names().keys())

    @classmethod
    def output_column_names(cls) -> List[str]:
        return list(cls.source_fields_and_output_names().values())

    def get_queryset(self):
        return YouthApplication.objects.active().order_by("created_at", "pk")

    def serializer(self, apps: QuerySet[YouthApplication]):
        return (self.generate_data_row(app) for app in apps)

    @enforce_handler_view_adfs_login
    def list(
        self, request, *args, **kwargs
    ) -> Union[HttpResponse, HttpResponseRedirect, StreamingHttpResponse]:
        with self.record_action(
            additional_information=f"{self.__class__.__name__}.list"
        ):
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
                content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
            response["Content-Disposition"] = (
                f"attachment; filename={self.xlsx_filename}"
            )
            return response

    @property
    def worksheet_name(self) -> str:
        return str(_("Nuorten kesäsetelihakemukset"))

    @property
    def header_format_properties(self) -> dict:
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

    def xlsx_template(self, queryset: QuerySet[YouthApplication]):
        result = io.BytesIO()
        workbook: Workbook = Workbook(result)
        worksheet: Worksheet = workbook.add_worksheet(self.worksheet_name)
        header_format: Format = workbook.add_format(self.header_format_properties)
        self.write_header(worksheet, header_format)
        self.write_data_row(
            worksheet=worksheet, row_number=1, app=queryset[0], is_template=True
        )
        workbook.close()
        return result
