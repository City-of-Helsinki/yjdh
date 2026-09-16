import shutil

import pytest
from django.test import override_settings


@pytest.fixture(scope="session", autouse=True)
def test_media_root(tmp_path_factory):
    media_root = tmp_path_factory.mktemp("media")
    with override_settings(MEDIA_ROOT=str(media_root)):
        yield


@pytest.fixture(autouse=True)
def pdfkit_without_system_binary(monkeypatch):
    if shutil.which("wkhtmltopdf"):
        return

    def fake_pdf_from_string(*_args, **_kwargs):
        return b"%PDF-1.4\n% test PDF\n"

    monkeypatch.setattr(
        "applications.services.ahjo_integration.pdfkit.from_string",
        fake_pdf_from_string,
    )
    monkeypatch.setattr(
        "applications.services.generate_application_summary.pdfkit.from_string",
        fake_pdf_from_string,
    )
