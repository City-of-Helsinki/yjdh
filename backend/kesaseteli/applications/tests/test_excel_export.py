import pytest
from django.shortcuts import reverse
from django.test import RequestFactory

from applications.enums import ApplicationStatus
from applications.exporters.excel_exporter import export_applications_as_xlsx_output
from applications.models import EmployerSummerVoucher


def excel_download_url():
    return reverse("excel-download")


@pytest.mark.django_db
def test_excel_view_get_with_authenticated_user(staff_client):
    response = staff_client.get(excel_download_url())
    assert response.status_code == 200


@pytest.mark.django_db
def test_excel_view_get_with_unauthenticated_user(user_client):
    response = user_client.get(excel_download_url())
    assert response.status_code == 302


@pytest.mark.django_db
def test_excel_view_download_unhandled(
    staff_client, submitted_summer_voucher, submitted_employment_contract_attachment
):
    submitted_summer_voucher.application.status = ApplicationStatus.SUBMITTED
    submitted_summer_voucher.application.save()

    response = staff_client.get(f"{excel_download_url()}?download=unhandled")

    assert response.status_code == 200
    submitted_summer_voucher.refresh_from_db()
    assert submitted_summer_voucher.is_exported is True
    # Cannot decode an xlsx file
    with pytest.raises(UnicodeDecodeError):
        response.content.decode()


@pytest.mark.django_db
def test_excel_view_download_no_unhandled_applications(staff_client):
    response = staff_client.get(f"{excel_download_url()}?download=unhandled")

    assert response.status_code == 200
    assert "Ei uusia käsittelemättömiä hakemuksia." in response.content.decode()


@pytest.mark.django_db
def test_excel_view_download_annual(
    staff_client, submitted_summer_voucher, submitted_employment_contract_attachment
):
    submitted_summer_voucher.application.status = ApplicationStatus.SUBMITTED
    submitted_summer_voucher.application.save()

    response = staff_client.get(f"{excel_download_url()}?download=annual")

    assert response.status_code == 200
    submitted_summer_voucher.refresh_from_db()
    assert submitted_summer_voucher.is_exported is False
    # Cannot decode an xlsx file
    with pytest.raises(UnicodeDecodeError):
        response.content.decode()


@pytest.mark.django_db
def test_excel_export_bytes(
    submitted_summer_voucher, submitted_employment_contract_attachment
):
    factory = RequestFactory()
    request = factory.get("/")

    value = export_applications_as_xlsx_output(
        EmployerSummerVoucher.objects.all(), request
    )

    assert type(value) == bytes
