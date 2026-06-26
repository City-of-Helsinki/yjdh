"""Tests for the global Permissions-Policy header on backend responses."""

import pytest
from django.test import Client
from django.test import override_settings
from django.urls import reverse

from common.middleware import PERMISSIONS_POLICY


def assert_expected_permissions_policy(response):
    """Check that a response has the global Permissions-Policy header.

    Args:
        response: Page response to check.
    """
    assert response.headers["Permissions-Policy"] == PERMISSIONS_POLICY


@pytest.mark.django_db
@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_excel_download_includes_permissions_policy(staff_client):
    """Check excel-download sends the restrictive Permissions-Policy header.

    Args:
        staff_client: Logged-in staff user client.
    """
    response = staff_client.get(reverse("excel-download"))
    assert response.status_code == 200
    assert_expected_permissions_policy(response)


def test_swagger_ui_includes_permissions_policy(client: Client):
    response = client.get(reverse("swagger-ui"))
    assert response.status_code == 200
    assert_expected_permissions_policy(response)


def test_redoc_includes_permissions_policy(client: Client):
    response = client.get(reverse("redoc"))
    assert response.status_code == 200
    assert_expected_permissions_policy(response)


def test_openapi_schema_includes_permissions_policy(client: Client):
    response = client.get(reverse("schema"), HTTP_ACCEPT="application/json")
    assert response.status_code == 200
    assert_expected_permissions_policy(response)
