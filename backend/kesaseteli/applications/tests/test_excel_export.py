import datetime
from decimal import Decimal
from io import BytesIO
from typing import List

import openpyxl
import pytest
from django.shortcuts import reverse
from django.test import override_settings
from django.urls.exceptions import NoReverseMatch
from freezegun import freeze_time

from applications.enums import EmployerApplicationStatus, ExcelColumns
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
    ORDER_FIELD_TITLE,
    RECEIVED_DATE_FIELD_TITLE,
    REMOVABLE_REPORTING_FIELD_TITLES,
    REMOVABLE_TALPA_FIELD_TITLES,
    SALARY_PAID_FIELD_TITLE,
    SPECIAL_CASE_FIELD_TITLE,
    WORK_HOURS_FIELD_TITLE,
)
from applications.models import EmployerSummerVoucher
from applications.tests.test_models import create_test_employer_summer_vouchers
from common.urls import handler_403_url


def excel_download_url():
    return reverse("excel-download")


def get_field_titles(fields: List[ExcelField]) -> List[str]:
    return [field.title for field in fields]


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
        response.content.decode()


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_excel_view_download_no_unhandled_applications(staff_client):
    response = staff_client.get(f"{excel_download_url()}?download=unhandled")

    assert response.status_code == 200
    assert "Ei uusia käsittelemättömiä hakemuksia." in response.content.decode()


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
        response.content.decode()


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
    vouchers = create_test_employer_summer_vouchers(year=2021)

    with freeze_time(datetime.datetime(2021, 12, 31)):
        response = staff_client.get(download_url)

    assert type(response.content) == bytes

    workbook = openpyxl.load_workbook(filename=BytesIO(response.content))
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
                assert output_column.value == row_number
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
                if expected_attachment_uri == "":
                    assert output_column.value is None
                else:
                    assert output_column.value == expected_attachment_uri
            elif excel_field.model_fields == [] and excel_field.value == "":
                assert output_column.value is None
            elif excel_field.model_fields == [] and excel_field.value != "":
                assert output_column.value == excel_field.value
            else:
                query = EmployerSummerVoucher.objects.filter(pk=voucher.pk)
                values_tuple = query.values_list(*excel_field.model_fields)[0]
                assert (
                    output_column.value == excel_field.value % values_tuple
                ), excel_field.title


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
    ],
)
def test_excel_view_download_with_unauthenticated_user(  # noqa: C901
    user_client,
    download_url,
):
    create_test_employer_summer_vouchers(year=2021)

    with freeze_time(datetime.datetime(2021, 12, 31)):
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
