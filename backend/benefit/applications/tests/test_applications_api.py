import pytest
from applications.api.v1.serializers import ApplicationSerializer
from applications.enums import ApplicationStatus
from applications.models import Application
from applications.tests.factories import ApplicationFactory
from companies.tests.factories import CompanyFactory
from helsinkibenefit.tests.conftest import *  # noqa
from rest_framework.reverse import reverse


def get_detail_url(application):
    return reverse("v1:application-detail", kwargs={"pk": application.id})


def test_applications_list(api_client, application):
    response = api_client.get(reverse("v1:application-list"))
    assert len(response.data) == 1
    assert response.status_code == 200


def test_applications_list_with_filter(api_client, application):
    application.status = ApplicationStatus.DRAFT
    application.save()
    url1 = reverse("v1:application-list") + "?status=draft"
    response = api_client.get(url1)
    assert len(response.data) == 1
    assert response.status_code == 200

    url2 = reverse("v1:application-list") + "?status=cancelled"
    response = api_client.get(url2)
    assert len(response.data) == 0
    assert response.status_code == 200

    url3 = reverse("v1:application-list") + "?status=cancelled,draft"
    response = api_client.get(url3)
    assert len(response.data) == 1
    assert response.status_code == 200


def test_application_single_read(api_client, application):
    response = api_client.get(get_detail_url(application))
    assert response.status_code == 200


def test_application_template(api_client):
    response = api_client.get(reverse("v1:application-get-application-template"))
    assert (
        len(response.data["de_minimis_aid_set"]) == 0
    )  # as of 2021-06-16, just a dummy implementation exists


def test_application_post(api_client, application):
    """
    Create a new application
    """
    data = ApplicationSerializer(application).data
    application.delete()
    assert len(Application.objects.all()) == 0

    del data["id"]
    response = api_client.post(
        reverse("v1:application-list"),
        data,
    )
    assert response.status_code == 201
    assert (
        response.data["company_contact_person_phone_number"]
        == data["company_contact_person_phone_number"]
    )
    new_application = Application.objects.all().first()
    assert (
        new_application.company_contact_person_phone_number
        == data["company_contact_person_phone_number"]
    )
    assert {v.identifier for v in new_application.bases.all()} == {
        b for b in data["bases"]
    }
    assert len(new_application.de_minimis_aid_set.all()) == len(
        data["de_minimis_aid_set"]
    )
    # ensure that the current values for company info are filled in
    assert new_application.company_name == new_application.company.name
    assert new_application.company_form == new_application.company.company_form
    assert (
        new_application.official_company_street_address
        == new_application.company.street_address
    )
    assert new_application.official_company_postcode == new_application.company.postcode
    assert new_application.official_company_city == new_application.company.city


def test_application_put_edit_fields(api_client, application):
    """
    modify existing application
    """
    data = ApplicationSerializer(application).data
    data["company_contact_person_phone_number"] = "0505658789"
    response = api_client.put(
        get_detail_url(application),
        data,
    )
    assert response.status_code == 200
    assert response.data["company_contact_person_phone_number"] == "0505658789"
    application.refresh_from_db()
    assert application.company_contact_person_phone_number == "0505658789"


def test_application_put_read_only_fields(api_client, application):
    """
    company info that is retrieved from official (YTJ or other) sources is not editable by applicant/handler
    Also, the company of the application can not be changed.
    """
    another_company = CompanyFactory()
    data = ApplicationSerializer(application).data
    original_data = data.copy()
    data["company_name"] = "Something completely different"
    data["official_company_street_address"] = "another address"
    data["company"] = {"id": another_company.pk}

    response = api_client.put(
        get_detail_url(application),
        data,
    )
    assert response.status_code == 200
    assert original_data["company_name"] == response.data["company_name"]
    assert (
        original_data["official_company_street_address"]
        == response.data["official_company_street_address"]
    )

    application.refresh_from_db()
    assert application.company_name == original_data["company_name"]
    assert (
        application.official_company_street_address
        == original_data["official_company_street_address"]
    )


def test_application_replace_de_minimis_aid(api_client, application):
    data = ApplicationSerializer(application).data

    data["de_minimis_aid"] = True
    data["de_minimis_aid_set"] = [
        {"granter": "aaa", "granted_at": "2021-06-15", "amount": "12345.00"}
    ]
    response = api_client.put(
        get_detail_url(application),
        data,
    )
    assert response.status_code == 200
    application.refresh_from_db()
    new_data = ApplicationSerializer(application).data
    del new_data["de_minimis_aid_set"][0]["id"]
    assert new_data["de_minimis_aid_set"][0]["ordering"] == 0
    del new_data["de_minimis_aid_set"][0]["ordering"]
    assert new_data["de_minimis_aid_set"] == data["de_minimis_aid_set"]


def test_application_edit_de_minimis_aid(api_client, application):
    data = ApplicationSerializer(application).data

    data["de_minimis_aid"] = True
    data["de_minimis_aid_set"][0]["granter"] = "something else"
    data["de_minimis_aid_set"][0]["amount"] = "4321.50"

    response = api_client.put(
        get_detail_url(application),
        data,
    )
    assert response.status_code == 200
    assert len(response.data["de_minimis_aid_set"]) == 2
    assert response.data["de_minimis_aid_set"][0]["granter"] == "something else"
    assert response.data["de_minimis_aid_set"][0]["amount"] == "4321.50"
    # check that the ordering is reset starting from 0
    assert response.data["de_minimis_aid_set"][0]["ordering"] == 0
    assert response.data["de_minimis_aid_set"][1]["ordering"] == 1


def test_application_delete_de_minimis_aid(api_client, application):
    data = ApplicationSerializer(application).data

    data["de_minimis_aid"] = False
    data["de_minimis_aid_set"] = []

    response = api_client.put(
        get_detail_url(application),
        data,
    )
    assert response.status_code == 200
    assert response.data["de_minimis_aid_set"] == []


def test_application_patch(api_client):
    application = ApplicationFactory(status=ApplicationStatus.DRAFT)
    data = {"status": ApplicationStatus.REJECTED.value}
    response = api_client.patch(
        get_detail_url(application),
        data,
    )

    assert response.status_code == 200
    assert response.data["status"] == ApplicationStatus.REJECTED

    application.refresh_from_db()
    assert application.status == ApplicationStatus.REJECTED


@pytest.mark.django_db
def test_application_delete(api_client, application):
    response = api_client.delete(get_detail_url(application))
    assert len(Application.objects.all()) == 0
    assert response.status_code == 204
