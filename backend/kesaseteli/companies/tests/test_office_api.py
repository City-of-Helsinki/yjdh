import pytest
from rest_framework import status

from common.tests.factories import CompanyFactory, OfficeFactory


def get_company_offices_url(company_id):
    return f"/v1/company/{company_id}/offices/"


@pytest.mark.django_db
def test_get_offices_by_company_business_id(api_client):
    company = CompanyFactory(business_id="1234567-8")
    OfficeFactory(company=company, name="Vantaa")

    response = api_client.get(get_company_offices_url(company.business_id))

    assert response.status_code == status.HTTP_200_OK
    assert response.data == ["Vantaa"]


@pytest.mark.django_db
def test_get_offices_only_returns_pertaining_company_offices(api_client):
    company_a = CompanyFactory(business_id="1234567-8")
    company_b = CompanyFactory(business_id="8765432-1")

    office_a1 = OfficeFactory(company=company_a, name="Alpha Office")
    office_a2 = OfficeFactory(company=company_a, name="Beta Office")
    office_b = OfficeFactory(company=company_b, name="Gamma Office")

    response_a = api_client.get(get_company_offices_url(company_a.business_id))
    assert response_a.status_code == status.HTTP_200_OK
    assert len(response_a.data) == 2
    assert response_a.data == [
        office_a1.name,
        office_a2.name,
    ]

    response_b = api_client.get(get_company_offices_url(company_b.business_id))
    assert response_b.status_code == status.HTTP_200_OK
    assert len(response_b.data) == 1
    assert response_b.data == [office_b.name]


@pytest.mark.django_db
def test_get_offices_empty_when_no_offices(api_client):
    company = CompanyFactory(business_id="1234567-8")

    response = api_client.get(get_company_offices_url(company.business_id))

    assert response.status_code == status.HTTP_200_OK
    assert response.data == []


@pytest.mark.django_db
def test_get_offices_non_existent_company(api_client):
    non_existent_id = "1234567-8"

    response = api_client.get(get_company_offices_url(non_existent_id))

    assert response.status_code == status.HTTP_200_OK
    assert response.data == []


@pytest.mark.django_db
def test_get_offices_unauthenticated(unauthenticated_api_client):
    company = CompanyFactory(business_id="1234567-8")
    OfficeFactory(company=company)

    response = unauthenticated_api_client.get(
        get_company_offices_url(company.business_id)
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN
