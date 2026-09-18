import shutil

import pytest
from django.test import override_settings


@pytest.fixture(scope="session", autouse=True)
def test_media_root(tmp_path_factory):
    media_root = tmp_path_factory.mktemp("media")
    with override_settings(MEDIA_ROOT=str(media_root)):
        yield


@pytest.fixture(autouse=True)
def pdf_renderer_without_system_binary(monkeypatch):
    if shutil.which("wkhtmltopdf"):
        return

    def fake_render_pdf(*_args, **_kwargs):
        return b"%PDF-1.4\n% test PDF\n"

    monkeypatch.setattr(
        "applications.services.ahjo_integration.render_pdf",
        fake_render_pdf,
    )
    monkeypatch.setattr(
        "applications.services.generate_application_summary.render_pdf",
        fake_render_pdf,
    )
