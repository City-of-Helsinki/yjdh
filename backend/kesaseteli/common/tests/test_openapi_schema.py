"""Regression tests for the Kesäseteli OpenAPI contract."""

from typing import Final

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
    status_operation = schema["paths"]["/v1/youthapplications/{id}/status/"]["get"]
    assert status_operation["operationId"] == "youthapplications_status_retrieve"
    assert status_operation["summary"] == "status retrieve"

    assert client.get(reverse("swagger-ui")).status_code == 200
    assert client.get(reverse("redoc")).status_code == 200


def test_openapi_schema_includes_handler_excel_export_endpoints(client: Client):
    """
    Handler Excel exports live outside /v1/ but must appear in the API schema.

    Employer exports use dedicated paths per export kind. Youth exports use a
    separate list endpoint. The landing page at /excel-download/ is HTML only.
    """
    schema = client.get(reverse("schema"), HTTP_ACCEPT="application/json").json()
    paths = schema["paths"]

    # HTML landing page should not be in the API schema.
    assert "/excel-download/" not in paths

    # Employer Excel exports:
    # - path params,
    # - tag, and
    # - allowed export kinds / column sets.
    employer_path = "/excel-download/employer-applications/{export_kind}/{columns}/"
    assert employer_path in paths
    employer_get = paths[employer_path]["get"]
    assert employer_get["tags"] == ["excel-download"]
    employer_parameters = {param["name"]: param for param in employer_get["parameters"]}
    assert employer_parameters["export_kind"]["in"] == "path"
    assert set(employer_parameters["export_kind"]["schema"]["enum"]) == {
        "annual",
        "annual-previous",
        "unhandled",
    }
    assert employer_parameters["columns"]["in"] == "path"
    assert set(employer_parameters["columns"]["schema"]["enum"]) == {
        "reporting",
        "talpa",
    }

    # Youth Excel export: separate list endpoint under the same tag.
    youth_path = "/excel-download/confirmed-youth-applications/"
    assert youth_path in paths
    assert paths[youth_path]["get"]["tags"] == ["excel-download"]


def test_schema_excludes_unsupported_kesaseteli_operations(client: Client):
    """
    Ensure the live schema only advertises operations the viewsets actually support.

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
