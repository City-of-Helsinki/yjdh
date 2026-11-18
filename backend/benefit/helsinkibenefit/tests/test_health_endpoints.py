import tomllib
from pathlib import Path
from unittest.mock import patch

import pytest
from django.db import OperationalError, connection


@pytest.mark.parametrize("url", ["/healthz", "/healthz/"])
def test_healthz_without_database(client, url):
    with patch.object(connection, "cursor", side_effect=OperationalError) as cursor:
        response = client.get(url)

    assert response.status_code == 200
    assert response.content == b""
    cursor.assert_not_called()


@pytest.mark.django_db
@pytest.mark.parametrize("url", ["/readiness", "/readiness/"])
def test_readiness(client, settings, url):
    settings.SENTRY_RELEASE = "benefit-backend@test-release"
    with (Path(settings.BASE_DIR) / "pyproject.toml").open("rb") as pyproject_file:
        version = tomllib.load(pyproject_file)["project"]["version"]

    response = client.get(url)

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "version": version,
        "release": "benefit-backend@test-release",
        "database": "ok",
    }


@pytest.mark.parametrize("url", ["/readiness", "/readiness/"])
def test_readiness_database_unavailable(client, settings, url):
    settings.SENTRY_RELEASE = None
    with patch.object(connection, "cursor", side_effect=OperationalError):
        response = client.get(url)

    assert response.status_code == 503
    assert response.json()["status"] == "error"
    assert response.json()["database"] == "error"
    assert response.json()["release"] == ""


@pytest.mark.parametrize("url", ["/healthz", "/healthz/", "/readiness", "/readiness/"])
def test_health_endpoints_require_get(client, url):
    response = client.post(url)

    assert response.status_code == 405
