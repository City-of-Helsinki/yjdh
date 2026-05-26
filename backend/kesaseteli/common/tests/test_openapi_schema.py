"""Regression tests for the Kesäseteli OpenAPI contract and exported schema."""

from pathlib import Path
from typing import Final

from django.core.management import call_command
from django.http import HttpResponse
from django.test import Client
from django.urls import reverse


def test_openapi_schema_uses_stable_application_language_enum_name(
    client: Client,
):
    """
    Regression test for a stable application language enum in the OpenAPI schema.

    If serializers define language choices differently, drf-spectacular may invent
    hash-suffixed names like LanguageC70Enum. ReDoc and Swagger should show
    ApplicationLanguageEnum with fi, sv, and en.

    Further context in PR #4089:
    https://github.com/City-of-Helsinki/yjdh/pull/4089
    """
    schema = client.get(reverse("schema"), HTTP_ACCEPT="application/json").json()
    enum_names = schema.get("components", {}).get("schemas", {})

    assert "ApplicationLanguageEnum" in enum_names
    assert enum_names["ApplicationLanguageEnum"]["enum"] == ["fi", "sv", "en"]


def test_openapi_schema_and_docs_routes_exist(client: Client):
    """Ensure the schema endpoint and documentation pages are reachable."""
    schema_response: HttpResponse = client.get(
        reverse("schema"), HTTP_ACCEPT="application/json"
    )
    schema = schema_response.json()

    assert schema_response.status_code == 200
    assert schema_response.content
    assert schema["openapi"] == "3.1.0"
    assert b"/v1/" in schema_response.content

    assert client.get(reverse("swagger-ui")).status_code == 200
    assert client.get(reverse("redoc")).status_code == 200


def test_schema_excludes_unsupported_kesaseteli_operations(client: Client) -> None:
    """
    Ensure the exported schema only advertises operations the viewsets actually
    support.

    DRF's router still creates the default collection/detail paths for the
    `YouthApplicationViewSet`, but the class overrides `list`, `update`,
    `partial_update`, and `destroy` to return HTTP 405. The schema must therefore
    expose only `POST /v1/youthapplications/` and `GET /v1/youthapplications/{id}/`
    for that resource, and it must omit `EmployerSummerVoucherViewSet` entirely
    because that viewset disables all default CRUD operations.
    """
    schema = client.get(reverse("schema"), HTTP_ACCEPT="application/json").json()

    youth_collection_path: Final[str] = "/v1/youthapplications/"
    youth_detail_path: Final[str] = "/v1/youthapplications/{id}/"

    assert "/v1/employersummervouchers/" not in schema["paths"]
    assert "/v1/employersummervouchers/{id}/" not in schema["paths"]
    assert set(schema["paths"][youth_collection_path]) == {"post"}
    assert set(schema["paths"][youth_detail_path]) == {"get"}


def test_openapi_schema_export_validates(tmp_path: Path) -> None:
    """Export the OpenAPI schema to a temporary YAML file and validate it.

    This test exercises the schema export path end to end and fails if the
    generated YAML cannot be validated.
    """
    schema_path: Path = tmp_path / "openapi.yaml"

    call_command("spectacular", file=str(schema_path), validate=True)

    assert schema_path.exists()
    assert schema_path.stat().st_size > 0
