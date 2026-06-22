"""Tests for per-view CSP on OpenAPI documentation pages."""

from django.test import Client
from django.urls import reverse


def test_swagger_ui_includes_api_docs_csp(client: Client):
    response = client.get(reverse("swagger-ui"))
    assert response.status_code == 200

    csp_header = response.headers["Content-Security-Policy"]
    assert "script-src 'self' 'unsafe-inline' cdn.jsdelivr.net" in csp_header
    assert "connect-src 'self' cdn.jsdelivr.net" in csp_header
    assert "worker-src 'self' blob:" in csp_header


def test_redoc_includes_api_docs_csp(client: Client):
    response = client.get(reverse("redoc"))
    assert response.status_code == 200

    csp_header = response.headers["Content-Security-Policy"]
    assert (
        "style-src 'self' 'unsafe-inline' cdn.jsdelivr.net fonts.googleapis.com"
        in csp_header
    )
    assert "font-src 'self' fonts.gstatic.com" in csp_header
    assert "cdn.redoc.ly" in csp_header


def test_openapi_schema_uses_global_csp_only(client: Client):
    response = client.get(reverse("schema"), HTTP_ACCEPT="application/json")
    assert response.status_code == 200

    csp_header = response.headers["Content-Security-Policy"]
    assert "default-src 'self'" in csp_header
    assert "cdn.redoc.ly" not in csp_header
    assert "worker-src" not in csp_header
    assert "font-src" not in csp_header
    assert "script-src 'self' 'unsafe-inline' cdn.jsdelivr.net" not in csp_header
