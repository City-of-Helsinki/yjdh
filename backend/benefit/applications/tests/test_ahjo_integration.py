import io
import zipfile
from datetime import date
from unittest.mock import patch

import factory.random
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


@pytest.fixture(autouse=True)
def reseed_fixtures(db, django_db_setup, django_db_blocker):
    factory.random.reseed_random("888")


@pytest.mark.parametrize(
    "company_type, de_minimis_aid",
    [
        ("ry", False),
        ("oy", False),
        ("oy", True),
    ],
)
@patch("applications.services.ahjo_integration.pdfkit.from_string")
def test_generate_single_template_html(
    mock_pdf_convert, snapshot, company_type, de_minimis_aid
):
    mock_pdf_convert.return_value = {}
    app = ApplicationFactory(
        company__company_form=company_type, de_minimis_aid=de_minimis_aid
    )
    # Only assert html snapshot for easier comparison
    _, _, html = generate_single_file(app)
    snapshot.assert_match(html)


@patch("applications.services.ahjo_integration.pdfkit.from_string")
def test_generate_composed_template_html(mock_pdf_convert, snapshot):
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

    # Only snapshot html content for easier comparison
    files = generate_composed_files(apps)
    assert len(files) == 4
    snapshot.assert_match([f[0] for f in files])

    assert app_1.ahjo_application_number in files[0][2]
    assert app_1.ahjo_application_number not in files[3][2]

    assert app_2.ahjo_application_number not in files[0][2]
    assert app_2.ahjo_application_number in files[3][2]

    assert app_3.ahjo_application_number not in files[0][2]
    assert app_3.ahjo_application_number not in files[3][2]


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
