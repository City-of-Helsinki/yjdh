import subprocess
from pathlib import Path

import pytest

from applications.services.pdf_renderer import render_pdf


def test_render_pdf_uses_safe_wkhtmltopdf_command(settings, monkeypatch):
    html = "<meta name='pdfkit---post-file' content='/etc/passwd'>"
    settings.WKHTMLTOPDF_BIN = "/usr/bin/wkhtmltopdf"

    def fake_run(command, **kwargs):
        html_path = Path(command[-2])
        assert html_path.name == "input.html"
        assert html_path.read_text(encoding="utf-8") == html
        assert command[:5] == [
            "/usr/bin/wkhtmltopdf",
            "--log-level",
            "info",
            "--disable-javascript",
            "--disable-local-file-access",
        ]
        assert command[-1] == "-"
        assert kwargs == {"check": False, "capture_output": True}
        return subprocess.CompletedProcess(command, 0, stdout=b"%PDF", stderr=b"")

    monkeypatch.setattr(
        "applications.services.pdf_renderer.subprocess.run",
        fake_run,
    )

    assert render_pdf(html) == b"%PDF"


def test_render_pdf_accepts_completed_nonzero_wkhtmltopdf_command(
    settings, monkeypatch
):
    settings.WKHTMLTOPDF_BIN = "/usr/bin/wkhtmltopdf"
    completed_pdf = b"%PDF-1.4\n"

    def fake_run(command, **_kwargs):
        return subprocess.CompletedProcess(
            command,
            1,
            stdout=completed_pdf,
            stderr=b"Warning: failed to load font\nDone\nExit with code 1\n",
        )

    monkeypatch.setattr(
        "applications.services.pdf_renderer.subprocess.run",
        fake_run,
    )

    assert render_pdf("<html></html>") == completed_pdf


def test_render_pdf_raises_for_failed_wkhtmltopdf_command(settings, monkeypatch):
    settings.WKHTMLTOPDF_BIN = "/usr/bin/wkhtmltopdf"

    def fake_run(command, **_kwargs):
        return subprocess.CompletedProcess(
            command,
            1,
            stdout=b"",
            stderr=b"Error: failed to generate PDF\n",
        )

    monkeypatch.setattr(
        "applications.services.pdf_renderer.subprocess.run",
        fake_run,
    )

    with pytest.raises(subprocess.CalledProcessError):
        render_pdf("<html></html>")
