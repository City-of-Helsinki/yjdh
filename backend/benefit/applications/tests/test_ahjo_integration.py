import io
import zipfile
from datetime import date
from unittest.mock import patch

import pytest
from applications.enums import ApplicationStatus
from applications.services.ahjo_integration import (
    export_application_batch,
    generate_composed_files,
    generate_single_approved_file,
    generate_single_declined_file,
)
from applications.tests.factories import ApplicationFactory
from companies.tests.factories import CompanyFactory
from helsinkibenefit.tests.conftest import *  # noqa


def _assert_html_content(html, include_keys=(), excluded_keys=()):
    for k in include_keys:
        assert k in html
    for k in excluded_keys:
        assert k not in html


@pytest.mark.parametrize(
    "company_type, de_minimis_aid",
    [
        ("ry", False),
        ("oy", False),
        ("oy", True),
    ],
)
@patch("applications.services.ahjo_integration.pdfkit.from_string")
def test_generate_single_approved_template_html(
    mock_pdf_convert, company_type, de_minimis_aid
):
    mock_pdf_convert.return_value = {}
    company = CompanyFactory(company_form=company_type)
    apps = ApplicationFactory.create_batch(
        3,
        company=company,
        de_minimis_aid=de_minimis_aid,
        status=ApplicationStatus.ACCEPTED,
        calculated_benefit_amount=1000,
    )
    # Only assert html content for easier comparison
    _, _, html = generate_single_approved_file(apps[0].company, apps)
    for app in apps:
        _assert_html_content(
            html,
            (
                app.ahjo_application_number,
                app.employee.first_name,
                app.employee.last_name,
            ),
        )


@patch("applications.services.ahjo_integration.pdfkit.from_string")
def test_generate_single_declined_template_html(mock_pdf_convert):
    mock_pdf_convert.return_value = {}
    company = CompanyFactory()
    apps = ApplicationFactory.create_batch(
        3, company=company, status=ApplicationStatus.REJECTED
    )
    # Only assert html content for easier comparison
    _, _, html = generate_single_declined_file(apps[0].company, apps)
    for app in apps:
        _assert_html_content(
            html,
            (
                app.ahjo_application_number,
                app.employee.first_name,
                app.employee.last_name,
            ),
        )


@patch("applications.services.ahjo_integration.pdfkit.from_string")
def test_generate_composed_template_html(mock_pdf_convert):
    mock_pdf_convert.return_value = {}
    accepted_app_1 = ApplicationFactory(
        status=ApplicationStatus.ACCEPTED,
        start_date=date.today(),
        calculated_benefit_amount=1000,
    )
    accepted_app_2 = ApplicationFactory(
        status=ApplicationStatus.ACCEPTED,
        start_date=date.today(),
        calculated_benefit_amount=1000,
    )
    rejected_app_1 = ApplicationFactory(
        status=ApplicationStatus.REJECTED, start_date=date.today()
    )
    rejected_app_2 = ApplicationFactory(
        status=ApplicationStatus.REJECTED, start_date=date.today()
    )

    # Only assert html content for easier comparison
    files = generate_composed_files(
        [accepted_app_1, accepted_app_2], [rejected_app_1, rejected_app_2]
    )
    assert len(files) == 3

    # files[0]: Public accepted composed files
    # files[1]: Private accepted composed files
    # files[2]: Private rejected composed files
    _assert_html_content(
        files[0][2],
        (
            accepted_app_1.ahjo_application_number,
            accepted_app_2.ahjo_application_number,
        ),
        (
            rejected_app_1.ahjo_application_number,
            rejected_app_2.ahjo_application_number,
            accepted_app_1.employee.first_name,
            accepted_app_2.employee.first_name,
        ),
    )
    _assert_html_content(
        files[1][2],
        (
            accepted_app_1.ahjo_application_number,
            accepted_app_2.ahjo_application_number,
        ),
        (rejected_app_1.ahjo_application_number,),
    )
    _assert_html_content(
        files[2][2],
        (
            rejected_app_1.ahjo_application_number,
            rejected_app_2.ahjo_application_number,
        ),
        (
            accepted_app_1.ahjo_application_number,
            accepted_app_2.ahjo_application_number,
        ),
    )


def test_export_application_batch(application_batch):
    application_batch.applications.add(
        ApplicationFactory.create(
            status=ApplicationStatus.ACCEPTED, calculated_benefit_amount=1000
        )
    )
    application_batch.applications.add(
        ApplicationFactory.create(status=ApplicationStatus.REJECTED)
    )
    application_batch.applications.add(
        ApplicationFactory.create(status=ApplicationStatus.CANCELLED)
    )

    zip_file = export_application_batch(application_batch)
    file_like_object = io.BytesIO(zip_file)
    archive = zipfile.ZipFile(file_like_object)
    assert (
        len(archive.infolist())
        == application_batch.applications.exclude(
            status=ApplicationStatus.CANCELLED
        ).count()
        + 3
    )
