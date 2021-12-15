import pytest
from rest_framework import status

from applications.models import School


def get_schools_api_url():
    return "/v1/schools/"


@pytest.mark.django_db
def test_schools_list_status_ok(api_client):
    response = api_client.get(get_schools_api_url())
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_schools_list_returns_list(api_client):
    response = api_client.get(get_schools_api_url())
    assert type(response.json()) == list


@pytest.mark.django_db
def test_schools_list_returns_non_empty(api_client):
    response = api_client.get(get_schools_api_url())
    assert len(response.json()) > 0


@pytest.mark.django_db
def test_schools_list_returns_active_school_count(api_client):
    response = api_client.get(get_schools_api_url())
    assert len(response.json()) == len(School.objects.active())


@pytest.mark.django_db
def test_schools_list_returns_string_collection(api_client):
    response = api_client.get(get_schools_api_url())
    assert all(type(element) == str for element in response.json())


@pytest.mark.django_db
def test_schools_list_returns_non_empty_strings_collection(api_client):
    response = api_client.get(get_schools_api_url())
    assert all(len(element.strip()) > 0 for element in response.json())


@pytest.mark.django_db
def test_schools_list_returns_unique_elements_collection(api_client):
    response = api_client.get(get_schools_api_url())
    assert len(set(response.json())) == len(response.json())


@pytest.mark.django_db
def test_schools_list_returns_sorted_collection(api_client):
    response = api_client.get(get_schools_api_url())
    assert sorted(response.json(), key=str.casefold) == response.json()
