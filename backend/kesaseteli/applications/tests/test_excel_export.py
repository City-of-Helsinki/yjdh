import random
from datetime import date, datetime, timedelta
from decimal import Decimal
from io import BytesIO
from typing import List

import openpyxl
import pytest
from django.http import StreamingHttpResponse
from django.shortcuts import reverse
from django.test import override_settings
from django.urls.exceptions import NoReverseMatch
from django.utils import translation
from django.utils.timezone import localdate
from freezegun import freeze_time

from applications.enums import (
    EmployerApplicationStatus,
    ExcelColumns,
    VtjTestCase,
    YouthApplicationStatus,
)
from applications.exporters.excel_exporter import (
    APPLICATION_LANGUAGE_FIELD_TITLE,
    EMPLOYMENT_END_DATE_FIELD_TITLE,
    EMPLOYMENT_START_DATE_FIELD_TITLE,
    ExcelField,
    FIELDS,
    get_attachment_uri,
    get_exportable_fields,
    get_reporting_columns,
    get_talpa_columns,
    HIRED_WITHOUT_VOUCHER_ASSESSMENT_FIELD_TITLE,
    INVOICER_EMAIL_FIELD_TITLE,
    INVOICER_NAME_FIELD_TITLE,
    INVOICER_PHONE_NUMBER_FIELD_TITLE,
    ORDER_FIELD_TITLE,
    RECEIVED_DATE_FIELD_TITLE,
    REMOVABLE_REPORTING_FIELD_TITLES,
    REMOVABLE_TALPA_FIELD_TITLES,
    SALARY_PAID_FIELD_TITLE,
    SPECIAL_CASE_FIELD_TITLE,
    WORK_HOURS_FIELD_TITLE,
)
from applications.models import EmployerSummerVoucher, YouthApplication
from applications.tests.test_models import create_test_employer_summer_vouchers
from applications.views import YouthApplicationExcelExportViewSet
from common.tests.factories import (
    ActiveVtjTestCaseYouthApplicationFactory,
    ActiveYouthApplicationFactory,
    EmployerApplicationFactory,
    EmployerSummerVoucherFactory,
    InactiveYouthApplicationFactory,
    YouthApplicationFactory,
)
from common.urls import handler_403_url
from shared.audit_log.models import AuditLogEntry


def excel_download_url():
    return reverse("excel-download")


def youth_excel_download_url():
    return reverse("youth-excel-download")


def get_field_titles(fields: List[ExcelField]) -> List[str]:
    return [field.title for field in fields]


def check_removable_field_titles(removable_field_titles):
    assert len(removable_field_titles) == len(set(removable_field_titles))
    assert set(removable_field_titles) <= set(get_field_titles(FIELDS))


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_excel_view_get_with_authenticated_user(staff_client):
    response = staff_client.get(excel_download_url())
    assert response.status_code == 200


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_excel_view_get_with_unauthenticated_user(user_client):
    try:
        response = user_client.get(excel_download_url())
    except NoReverseMatch as e:
        # If ENABLE_ADMIN is off redirecting to Django admin login will not work
        assert str(e) == "'admin' is not a registered namespace"
    else:
        assert response.status_code == 302
        assert response.url == handler_403_url()


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_excel_view_download_unhandled(
    staff_client, submitted_summer_voucher, submitted_employment_contract_attachment
):
    submitted_summer_voucher.application.status = EmployerApplicationStatus.SUBMITTED
    submitted_summer_voucher.application.save()

    response = staff_client.get(f"{excel_download_url()}?download=unhandled")

    assert response.status_code == 200
    submitted_summer_voucher.refresh_from_db()
    assert submitted_summer_voucher.is_exported is True
    # Cannot decode an xlsx file
    with pytest.raises(UnicodeDecodeError):
        response.getvalue().decode()


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_excel_view_download_no_unhandled_applications(staff_client):
    response = staff_client.get(f"{excel_download_url()}?download=unhandled")

    assert response.status_code == 200
    assert "Ei uusia käsittelemättömiä hakemuksia." in response.content.decode()


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.parametrize("columns", ExcelColumns.values)
def test_excel_view_download_no_annual_applications(staff_client, columns):
    # Create draft applications with/without voucher, these should not be returned
    EmployerSummerVoucherFactory(
        application=EmployerApplicationFactory(status=EmployerApplicationStatus.DRAFT)
    )
    EmployerApplicationFactory(status=EmployerApplicationStatus.DRAFT)

    response = staff_client.get(
        f"{excel_download_url()}?download=annual&columns={columns}"
    )

    assert response.status_code == 200
    assert "Hakemuksia ei löytynyt." in response.content.decode()


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_youth_excel_download_no_youth_applications(staff_client):
    response = staff_client.get(youth_excel_download_url())
    assert response.status_code == 200
    assert "Hakemuksia ei löytynyt." in response.content.decode()


@pytest.mark.django_db
def test_youth_excel_download_writes_audit_log(staff_client, youth_application):
    old_audit_log_entry_count = AuditLogEntry.objects.count()
    response = staff_client.get(youth_excel_download_url())

    assert AuditLogEntry.objects.count() == old_audit_log_entry_count + 1
    audit_event = AuditLogEntry.objects.first().message["audit_event"]
    assert audit_event["actor"]["role"] == "USER"
    assert audit_event["actor"]["user_id"] == str(response.wsgi_request.user.pk)
    assert audit_event["status"] == "SUCCESS"
    assert audit_event["operation"] == "READ"
    assert audit_event["target"]["id"] == ""
    assert audit_event["target"]["type"] == "YouthApplication"
    assert (
        audit_event["additional_information"]
        == "YouthApplicationExcelExportViewSet.list"
    )


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_excel_view_download_annual(
    staff_client, submitted_summer_voucher, submitted_employment_contract_attachment
):
    submitted_summer_voucher.application.status = EmployerApplicationStatus.SUBMITTED
    submitted_summer_voucher.application.save()

    response = staff_client.get(f"{excel_download_url()}?download=annual")

    assert response.status_code == 200
    submitted_summer_voucher.refresh_from_db()
    assert submitted_summer_voucher.is_exported is False
    # Cannot decode an xlsx file
    with pytest.raises(UnicodeDecodeError):
        response.getvalue().decode()


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.parametrize(
    "download_url,expected_output_excel_fields",
    [
        (
            (
                f"{excel_download_url()}?download={download}"
                + ("" if columns is None else f"&columns={columns}")
            ),
            get_exportable_fields(
                ExcelColumns.REPORTING.value if columns is None else columns
            ),
        )
        for columns in ExcelColumns.values + [None]
        for download in ["unhandled", "annual"]
    ],
)
def test_excel_view_download_content(  # noqa: C901
    staff_client,
    download_url,
    expected_output_excel_fields: List[ExcelField],
):
    def employer_summer_voucher_sorting_key(voucher: EmployerSummerVoucher):
        # Sorting key should be the same as what is used to order by queryset results
        # in Excel download, see EmployerApplicationExcelDownloadView
        return voucher.last_submitted_at, voucher.created_at, voucher.pk

    vouchers: List[EmployerSummerVoucher] = sorted(
        create_test_employer_summer_vouchers(year=2021),
        key=employer_summer_voucher_sorting_key,
    )

    with freeze_time(datetime(2021, 12, 31)):
        response = staff_client.get(download_url)

    assert isinstance(response, StreamingHttpResponse)

    workbook = openpyxl.load_workbook(filename=BytesIO(response.getvalue()))
    active_worksheet = workbook.active

    rows_generator = active_worksheet.rows
    header_row = next(rows_generator)
    data_rows = [next(rows_generator) for _ in range(len(vouchers))]
    with pytest.raises(StopIteration):
        next(rows_generator)

    expected_output_field_titles = get_field_titles(expected_output_excel_fields)
    output_field_titles = [
        "" if column.value is None else column.value  # Export changes "" to None
        for column in header_row
    ]

    # Check that output header is correct
    assert output_field_titles == expected_output_field_titles

    # Check that output data is correct
    for row_number, (data_row, voucher) in enumerate(zip(data_rows, vouchers), start=1):
        for output_column, excel_field in zip(data_row, expected_output_excel_fields):
            if excel_field.title == ORDER_FIELD_TITLE:
                assert output_column.value == row_number, "Incorrect output sorting"
            elif excel_field.title == RECEIVED_DATE_FIELD_TITLE:
                assert (
                    output_column.value
                    == voucher.last_submitted_at.astimezone().strftime("%d/%m/%Y")
                )
            elif excel_field.title == APPLICATION_LANGUAGE_FIELD_TITLE:
                assert output_column.value == voucher.application.get_language_display()
            elif excel_field.title == SPECIAL_CASE_FIELD_TITLE:
                assert output_column.value == voucher.get_target_group_display()
            elif excel_field.title == EMPLOYMENT_START_DATE_FIELD_TITLE:
                assert output_column.value == voucher.employment_start_date.strftime(
                    "%d.%m.%Y"
                )
            elif excel_field.title == EMPLOYMENT_END_DATE_FIELD_TITLE:
                assert output_column.value == voucher.employment_end_date.strftime(
                    "%d.%m.%Y"
                )
            elif excel_field.title == HIRED_WITHOUT_VOUCHER_ASSESSMENT_FIELD_TITLE:
                assert (
                    output_column.value
                    == voucher.get_hired_without_voucher_assessment_display()
                )
            elif excel_field.title == WORK_HOURS_FIELD_TITLE:
                work_hours = voucher.employment_work_hours
                assert (output_column.value is None and work_hours is None) or Decimal(
                    output_column.value
                ) == work_hours
            elif excel_field.title == SALARY_PAID_FIELD_TITLE:
                salary_paid = voucher.employment_salary_paid
                assert (output_column.value is None and salary_paid is None) or Decimal(
                    output_column.value
                ) == salary_paid
            elif excel_field.model_fields == ["attachments"]:
                expected_attachment_uri = get_attachment_uri(
                    voucher, excel_field, voucher.attachments, response.wsgi_request
                )
                assert output_column.value == expected_attachment_uri
            elif (
                excel_field.title
                in (
                    INVOICER_EMAIL_FIELD_TITLE,
                    INVOICER_NAME_FIELD_TITLE,
                    INVOICER_PHONE_NUMBER_FIELD_TITLE,
                )
                and not voucher.application.is_separate_invoicer
            ):
                assert output_column.value == "", excel_field.title
            elif excel_field.model_fields == []:
                assert output_column.value == excel_field.value
            else:
                query = EmployerSummerVoucher.objects.filter(pk=voucher.pk)
                values_tuple = query.values_list(*excel_field.model_fields)[0]
                assert (
                    output_column.value == excel_field.value % values_tuple
                ), excel_field.title


@pytest.mark.django_db
@override_settings(
    EXCEL_DOWNLOAD_BATCH_SIZE=3,
    NEXT_PUBLIC_MOCK_FLAG=False,
)
def test_youth_excel_download_content(staff_client):  # noqa: C901
    def youth_application_sorting_key(app: YouthApplication):
        # Sorting key should be the same as what is used to order by queryset results
        return app.created_at, app.pk

    InactiveYouthApplicationFactory()  # This should not be exported
    apps = (
        ActiveYouthApplicationFactory.create_batch(size=12)
        + [
            YouthApplicationFactory(status=status)
            for status in YouthApplicationStatus.active_values()
        ]
        + [
            ActiveVtjTestCaseYouthApplicationFactory(last_name=vtj_test_case)
            for vtj_test_case in VtjTestCase.values
        ]
    )
    # Update created_at specially as its initial save uses auto_now_add
    for app in apps:
        app.created_at -= timedelta(seconds=random.randint(0, 60 * 60 * 24 * 10))
        app.save(update_fields=["created_at"])
        app.refresh_from_db()
    assert min(app.created_at for app in apps) != max(app.created_at for app in apps)
    apps = sorted(apps, key=youth_application_sorting_key)

    with translation.override("en"):  # Should still use Finnish translations
        response = staff_client.get(youth_excel_download_url())

    assert isinstance(response, StreamingHttpResponse)

    workbook = openpyxl.load_workbook(filename=BytesIO(response.getvalue()))
    active_worksheet = workbook.active

    rows_generator = active_worksheet.rows
    header_row = next(rows_generator)
    data_rows = [next(rows_generator) for _ in apps]
    with pytest.raises(StopIteration):
        next(rows_generator)

    output_column_names = [column.value for column in header_row]
    with translation.override("fi"):  # Make extra sure to test for Finnish column names
        expected_output_columns_names = (
            YouthApplicationExcelExportViewSet.output_column_names()
        )
    assert output_column_names == expected_output_columns_names

    source_fields = YouthApplicationExcelExportViewSet.source_fields()
    for data_row, app in zip(data_rows, apps):
        for output_cell, source_field in zip(data_row, source_fields):
            output_value = output_cell.value
            if source_field == "application_date":
                assert date.fromisoformat(output_value) == localdate(app.created_at)
            elif source_field == "id":
                assert output_value == str(app.id)
            elif source_field.endswith("application_year"):
                assert int(output_value) == localdate(app.created_at).year
            elif source_field == "summer_voucher_serial_number":
                if output_value is None:
                    assert not app.has_youth_summer_voucher
                else:
                    assert (
                        int(output_value)
                        == app.youth_summer_voucher.summer_voucher_serial_number
                    )
            elif source_field == "birth_year":
                assert int(output_value) == app.birthdate.year
            elif source_field == "birthdate":
                assert date.fromisoformat(output_value) == app.birthdate
            elif source_field == "is_unlisted_school":
                assert output_value in ["Kyllä", "Ei"]
                assert (output_value == "Kyllä") == app.is_unlisted_school
            elif source_field == "additional_info_user_reasons":
                if output_value == "":
                    assert app.additional_info_user_reasons == []
                else:
                    assert output_value.split(", ") == sorted(
                        app.additional_info_user_reasons
                    )
            elif source_field == "confirmation_date":
                assert date.fromisoformat(output_value) == localdate(
                    app.receipt_confirmed_at
                )
            elif source_field.endswith("additional_info_providing_date"):
                if output_value == "":
                    assert app.additional_info_provided_at is None
                else:
                    assert date.fromisoformat(output_value) == localdate(
                        app.additional_info_provided_at
                    )
            elif source_field == "handling_date":
                if output_value == "":
                    assert app.handled_at is None
                else:
                    assert date.fromisoformat(output_value) == localdate(app.handled_at)
            else:
                assert output_value == getattr(app, source_field), source_field


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
@pytest.mark.parametrize(
    "download_url",
    [
        (
            f"{excel_download_url()}?download={download}"
            + ("" if columns is None else f"&columns={columns}")
        )
        for columns in ExcelColumns.values + [None]
        for download in ["unhandled", "annual"]
    ]
    + [youth_excel_download_url()],
)
def test_excel_view_download_with_unauthenticated_user(  # noqa: C901
    user_client, download_url, accepted_youth_application
):
    create_test_employer_summer_vouchers(year=2021)

    with freeze_time(datetime(2021, 12, 31)):
        response = user_client.get(download_url)

    assert response.status_code == 302
    assert response.url == handler_403_url()


def test_unique_fields_besides_padding_fields():
    field_titles = get_field_titles(FIELDS)
    field_titles_without_padding_fields = [
        field_title for field_title in field_titles if field_title != ""
    ]
    assert len(set(field_titles_without_padding_fields)) == len(
        field_titles_without_padding_fields
    ), "Duplicates in FIELDS besides empty strings"


@pytest.mark.parametrize(
    "field_titles,source",
    [
        (get_field_titles(FIELDS), "FIELDS"),
        (get_field_titles(get_reporting_columns()), "get_reporting_columns"),
        (get_field_titles(get_talpa_columns()), "get_talpa_columns"),
    ],
)
def test_order_field(field_titles, source):
    assert ORDER_FIELD_TITLE in field_titles
    assert field_titles.index(ORDER_FIELD_TITLE) == 0


@pytest.mark.parametrize(
    "field_titles,source",
    [
        (get_field_titles(FIELDS), "FIELDS"),
        (get_field_titles(get_reporting_columns()), "get_reporting_columns"),
        (get_field_titles(get_talpa_columns()), "get_talpa_columns"),
    ],
)
def test_received_data_field(field_titles, source):
    assert RECEIVED_DATE_FIELD_TITLE in field_titles
    assert field_titles.index(RECEIVED_DATE_FIELD_TITLE) == 1


def test_reporting_fields():
    field_titles = get_field_titles(FIELDS)
    reporting_field_titles = get_field_titles(get_reporting_columns())
    assert set(reporting_field_titles) == (
        set(field_titles) - set(REMOVABLE_REPORTING_FIELD_TITLES)
    )
    assert get_reporting_columns() == get_exportable_fields(
        ExcelColumns.REPORTING.value
    )


def test_talpa_fields():
    field_titles = get_field_titles(FIELDS)
    talpa_field_titles = get_field_titles(get_talpa_columns())
    assert set(talpa_field_titles) == (
        set(field_titles) - set(REMOVABLE_TALPA_FIELD_TITLES)
    )
    assert get_talpa_columns() == get_exportable_fields(ExcelColumns.TALPA.value)


def test_removable_reporting_field_titles():
    check_removable_field_titles(REMOVABLE_REPORTING_FIELD_TITLES)


def test_removable_talpa_field_titles():
    check_removable_field_titles(REMOVABLE_TALPA_FIELD_TITLES)
