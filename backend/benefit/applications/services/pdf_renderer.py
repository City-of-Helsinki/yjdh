import subprocess
from pathlib import Path
from tempfile import TemporaryDirectory

from django.conf import settings


def _completed_with_pdf(result: subprocess.CompletedProcess) -> bool:
    stderr_lines = (result.stderr or b"").decode("utf-8", errors="replace").splitlines()
    return (
        (result.stdout or b"").startswith(b"%PDF")
        and len(stderr_lines) > 1
        and stderr_lines[-2].strip() == "Done"
    )


def render_pdf(html: str) -> bytes:
    with TemporaryDirectory() as temporary_directory:
        html_path = Path(temporary_directory) / "input.html"
        html_path.write_text(html, encoding="utf-8")

        result = subprocess.run(
            [
                settings.WKHTMLTOPDF_BIN,
                "--log-level",
                "info",
                "--disable-javascript",
                "--disable-local-file-access",
                str(html_path),
                "-",
            ],
            check=False,
            capture_output=True,
        )

    if result.returncode != 0 and not _completed_with_pdf(result):
        raise subprocess.CalledProcessError(
            result.returncode,
            result.args,
            output=result.stdout,
            stderr=result.stderr,
        )

    return result.stdout
