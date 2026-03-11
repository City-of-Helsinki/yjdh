"""
Tests for Kubernetes liveness and readiness probe endpoints.

These endpoints are used by OpenShift/Kubernetes to determine pod health.
"""

from unittest.mock import patch

import pytest
from django.test import Client
from django.urls import reverse


@pytest.fixture
def client():
    """Django test client for unauthenticated requests."""
    return Client()


# --- healthz probe tests ---


def test_healthz_returns_200_empty_body(client):
    """
    Healthz returns 200 with empty body.

    Does not check dependencies; liveness only.
    """
    url = reverse("healthz")
    response = client.get(url)
    assert response.status_code == 200
    assert response.content == b""


def test_healthz_head_returns_200(client):
    """Healthz accepts HEAD and returns 200."""
    url = reverse("healthz")
    response = client.head(url)
    assert response.status_code == 200


def test_healthz_rejects_post(client):
    """Healthz only accepts GET and HEAD requests."""
    response = client.post("/healthz")
    assert response.status_code == 405


# --- readiness probe tests ---


@pytest.mark.django_db
def test_readiness_returns_200_when_db_ok(client):
    """
    Readiness returns 200 with metadata when database is reachable.
    """
    response = client.get("/readiness")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "ok"
    assert set(data) == {"status", "packageVersion", "release", "buildTime", "database"}
    assert "packageVersion" in data
    assert "release" in data
    assert "buildTime" in data


@pytest.mark.django_db
@patch("common.views.connection")
def test_readiness_returns_503_when_db_down(mock_connection, client):
    """
    Readiness returns 503 when database check fails.
    """
    mock_connection.cursor.side_effect = Exception("DB is down")
    response = client.get("/readiness")
    assert response.status_code == 503
    data = response.json()
    assert data["status"] == "error"
    assert data["database"] == "error"
    assert set(data) == {"status", "packageVersion", "release", "buildTime", "database"}


def test_readiness_rejects_post(client):
    """Readiness only accepts GET and HEAD requests."""
    response = client.post("/readiness")
    assert response.status_code == 405
