import io
import zipfile
from datetime import date
from unittest.mock import patch

import pytest
from applications.enums import ApplicationStatus
from applications.models import Application
from applications.services.ahjo_integration import (
    export_application_batch,
    generate_composed_files,
    generate_single_file,
)
from applications.tests.factories import ApplicationFactory
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
def test_generate_single_template_html(mock_pdf_convert, company_type, de_minimis_aid):
    mock_pdf_convert.return_value = {}
    app = ApplicationFactory(
        company__company_form=company_type, de_minimis_aid=de_minimis_aid
    )
    # Only assert html content for easier comparison
    _, _, html = generate_single_file(app)

    _assert_html_content(
        html,
        (app.ahjo_application_number, app.employee.first_name, app.employee.last_name),
    )


@patch("applications.services.ahjo_integration.pdfkit.from_string")
def test_generate_composed_template_html(mock_pdf_convert):
    mock_pdf_convert.return_value = {}
    app_1 = ApplicationFactory.create(
        status=ApplicationStatus.ACCEPTED, start_date=date.today()
    )
    app_2 = ApplicationFactory.create(
        status=ApplicationStatus.REJECTED, start_date=date.today()
    )
    app_3 = ApplicationFactory.create(
        status=ApplicationStatus.CANCELLED, start_date=date.today()
    )
    apps = Application.objects.all()

    # Only assert html content for easier comparison
    files = generate_composed_files(apps)
    assert len(files) == 4

    # files[0]: Public accepted composed files
    # files[1]: Private accepted composed files
    # files[2]: Public rejected composed files
    # files[3]: Private rejected composed files
    _assert_html_content(
        files[0][2],
        (app_1.ahjo_application_number),
        (app_2.ahjo_application_number, app_3.ahjo_application_number),
    )
    _assert_html_content(
        files[1][2],
        (app_1.ahjo_application_number),
        (app_2.ahjo_application_number, app_3.ahjo_application_number),
    )
    _assert_html_content(
        files[2][2],
        (app_2.ahjo_application_number),
        (app_1.ahjo_application_number, app_3.ahjo_application_number),
    )
    _assert_html_content(
        files[3][2],
        (app_2.ahjo_application_number),
        (app_1.ahjo_application_number, app_3.ahjo_application_number),
    )


def test_export_application_batch(application_batch):
    application_batch.applications.add(
        ApplicationFactory(status=ApplicationStatus.ACCEPTED)
    )
    application_batch.applications.add(
        ApplicationFactory(status=ApplicationStatus.REJECTED)
    )

    zip_file = export_application_batch(application_batch)
    file_like_object = io.BytesIO(zip_file)
    archive = zipfile.ZipFile(file_like_object)
    assert len(archive.infolist()) == application_batch.applications.count() + 4
