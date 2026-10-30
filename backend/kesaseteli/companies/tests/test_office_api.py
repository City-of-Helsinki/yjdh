import uuid

import pytest
from django.test import RequestFactory
from rest_framework import status

from common.tests.factories import CompanyFactory, OfficeFactory
from companies.api.v1.views import OfficeViewSet


def get_company_offices_url(company_id):
    return f"/v1/company/{company_id}/offices/"


@pytest.mark.django_db
def test_get_offices_by_company_uuid(api_client):
    company = CompanyFactory()
    OfficeFactory(company=company, name="Helsinki")
    OfficeFactory(company=company, name="Espoo")

    response = api_client.get(get_company_offices_url(company.id))

    assert response.status_code == status.HTTP_200_OK
    assert response.data == [
        {"name": "Espoo"},
        {"name": "Helsinki"},
    ]


@pytest.mark.django_db
def test_get_offices_by_company_business_id(api_client):
    company = CompanyFactory(business_id="1234567-8")
    OfficeFactory(company=company, name="Vantaa")

    response = api_client.get(get_company_offices_url(company.business_id))

    assert response.status_code == status.HTTP_200_OK
    assert response.data == [{"name": "Vantaa"}]


@pytest.mark.django_db
def test_get_offices_only_returns_pertaining_company_offices(api_client):
    company_a = CompanyFactory()
    company_b = CompanyFactory()

    office_a1 = OfficeFactory(company=company_a, name="Alpha Office")
    office_a2 = OfficeFactory(company=company_a, name="Beta Office")
    office_b = OfficeFactory(company=company_b, name="Gamma Office")

    response_a = api_client.get(get_company_offices_url(company_a.id))
    assert response_a.status_code == status.HTTP_200_OK
    assert len(response_a.data) == 2
    assert response_a.data == [
        {"name": office_a1.name},
        {"name": office_a2.name},
    ]

    response_b = api_client.get(get_company_offices_url(company_b.id))
    assert response_b.status_code == status.HTTP_200_OK
    assert len(response_b.data) == 1
    assert response_b.data == [{"name": office_b.name}]


@pytest.mark.django_db
def test_get_offices_empty_when_no_offices(api_client):
    company = CompanyFactory()

    response = api_client.get(get_company_offices_url(company.id))

    assert response.status_code == status.HTTP_200_OK
    assert response.data == []


@pytest.mark.django_db
def test_get_offices_non_existent_company(api_client):
    non_existent_id = uuid.uuid4()

    response = api_client.get(get_company_offices_url(non_existent_id))

    assert response.status_code == status.HTTP_200_OK
    assert response.data == []


@pytest.mark.django_db
def test_get_offices_unauthenticated(unauthenticated_api_client):
    company = CompanyFactory()
    OfficeFactory(company=company)

    response = unauthenticated_api_client.get(get_company_offices_url(company.id))

    assert response.status_code in [
        status.HTTP_401_UNAUTHORIZED,
        status.HTTP_403_FORBIDDEN,
    ]


@pytest.mark.django_db
def test_office_viewset_direct_kwargs(user):
    factory = RequestFactory()
    company = CompanyFactory()
    OfficeFactory(company=company, name="Direct Test Office")

    request = factory.get("/")
    request.user = user

    view = OfficeViewSet()

    # Test company_id kwarg
    response = view.get(request, company_id=str(company.id))
    assert response.status_code == status.HTTP_200_OK
    assert response.data == [{"name": "Direct Test Office"}]

    # Test pk kwarg
    response = view.get(request, pk=str(company.id))
    assert response.status_code == status.HTTP_200_OK
    assert response.data == [{"name": "Direct Test Office"}]

    # Test company_pk kwarg
    response = view.get(request, company_pk=str(company.id))
    assert response.status_code == status.HTTP_200_OK
    assert response.data == [{"name": "Direct Test Office"}]

    # Test query param
    req_with_param = factory.get(f"/?company_id={company.id}")
    req_with_param.user = user
    response = view.get(req_with_param)
    assert response.status_code == status.HTTP_200_OK
    assert response.data == [{"name": "Direct Test Office"}]

    # Test no company identifier
    response = view.get(request)
    assert response.status_code == status.HTTP_200_OK
    assert response.data == []
