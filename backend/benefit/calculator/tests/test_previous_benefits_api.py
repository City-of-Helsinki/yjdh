import decimal

from django.test import override_settings
from rest_framework.reverse import reverse

from applications.tests.conftest import *  # noqa
from calculator.api.v1.serializers import PreviousBenefitSerializer
from calculator.models import PreviousBenefit
from calculator.tests.factories import PreviousBenefitFactory


def get_previous_benefits_detail_url(previous_benefit):
    return reverse("v1:previousbenefit-detail", kwargs={"pk": previous_benefit.id})


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_get_previous_benefit_unauthenticated(anonymous_client, previous_benefit):
    response = anonymous_client.get(get_previous_benefits_detail_url(previous_benefit))
    assert response.status_code == 403


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_get_previous_benefit_applicant(api_client, previous_benefit):
    response = api_client.get(get_previous_benefits_detail_url(previous_benefit))
    assert response.status_code == 403


def test_get_previous_benefit_handler(handler_api_client, previous_benefit):
    response = handler_api_client.get(
        get_previous_benefits_detail_url(previous_benefit)
    )
    assert response.data["id"] == str(previous_benefit.id)
    assert (
        decimal.Decimal(response.data["monthly_amount"])
        == previous_benefit.monthly_amount
    )
    assert response.data["company"] == previous_benefit.company.id
    assert response.status_code == 200


def test_previous_benefits_list(handler_api_client, previous_benefit):
    response = handler_api_client.get(reverse("v1:previousbenefit-list"))
    assert len(response.data) == 1
    assert response.status_code == 200


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_previous_benefits_list_as_applicant(api_client, previous_benefit):
    response = api_client.get(reverse("v1:previousbenefit-list"))
    assert response.status_code == 403


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_previous_benefits_list_unauthenticated(anonymous_client, previous_benefit):
    response = anonymous_client.get(reverse("v1:previousbenefit-list"))
    assert response.status_code == 403


def test_filter_previous_benefit_by_ssn(handler_api_client, previous_benefit):
    benefit2 = PreviousBenefitFactory(social_security_number="123456-7890")
    assert previous_benefit.social_security_number != benefit2.social_security_number
    url = (
        reverse("v1:previousbenefit-list")
        + f"?social_security_number={previous_benefit.social_security_number}"
    )
    response = handler_api_client.get(url)
    assert len(response.data) == 1
    assert response.data[0]["id"] == str(previous_benefit.id)
    assert response.status_code == 200


def test_create_previous_benefit(handler_api_client, previous_benefit):
    data = PreviousBenefitSerializer(previous_benefit).data
    previous_benefit.delete()
    assert len(PreviousBenefit.objects.all()) == 0
    del data["id"]  # id is read-only field and would be ignored
    response = handler_api_client.post(
        reverse("v1:previousbenefit-list"),
        data,
    )
    assert response.status_code == 201


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_create_previous_benefit_unauthenticated(anonymous_client, previous_benefit):
    data = PreviousBenefitSerializer(previous_benefit).data
    previous_benefit.delete()
    assert len(PreviousBenefit.objects.all()) == 0
    del data["id"]  # id is read-only field and would be ignored
    response = anonymous_client.post(
        reverse("v1:previousbenefit-list"),
        data,
    )
    assert response.status_code == 403


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_create_previous_benefit_as_applicant(api_client, previous_benefit):
    data = PreviousBenefitSerializer(previous_benefit).data
    previous_benefit.delete()
    assert len(PreviousBenefit.objects.all()) == 0
    del data["id"]  # id is read-only field and would be ignored
    response = api_client.post(
        reverse("v1:previousbenefit-list"),
        data,
    )
    assert response.status_code == 403


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_previous_benefit_put_as_applicant(api_client, previous_benefit):
    data = PreviousBenefitSerializer(previous_benefit).data
    data["monthly_amount"] = "1234.56"
    response = api_client.put(
        get_previous_benefits_detail_url(previous_benefit),
        data,
    )
    assert response.status_code == 403


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_previous_benefit_put_unauthenticated(anonymous_client, previous_benefit):
    data = PreviousBenefitSerializer(previous_benefit).data
    data["monthly_amount"] = "1234.56"
    response = anonymous_client.put(
        get_previous_benefits_detail_url(previous_benefit),
        data,
    )
    assert response.status_code == 403


def test_previous_benefit_put(handler_api_client, previous_benefit):
    """
    modify existing previous_benefit
    """
    data = PreviousBenefitSerializer(previous_benefit).data
    data["monthly_amount"] = "1234.56"
    response = handler_api_client.put(
        get_previous_benefits_detail_url(previous_benefit),
        data,
    )
    assert response.status_code == 200
    assert response.data["monthly_amount"] == "1234.56"
    previous_benefit.refresh_from_db()
    assert previous_benefit.monthly_amount == decimal.Decimal("1234.56")


def test_previous_benefit_delete(handler_api_client, previous_benefit):
    """
    modify existing previous_benefit
    """
    response = handler_api_client.delete(
        get_previous_benefits_detail_url(previous_benefit)
    )
    assert response.status_code == 204

    assert PreviousBenefit.objects.all().count() == 0


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_previous_benefit_delete_unauthenticated(anonymous_client, previous_benefit):
    """
    modify existing previous_benefit
    """
    response = anonymous_client.delete(
        get_previous_benefits_detail_url(previous_benefit)
    )
    assert response.status_code == 403
    assert PreviousBenefit.objects.all().count() == 1


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_previous_benefit_delete_as_applicant(api_client, previous_benefit):
    """
    modify existing previous_benefit
    """
    response = api_client.delete(get_previous_benefits_detail_url(previous_benefit))
    assert response.status_code == 403
    assert PreviousBenefit.objects.all().count() == 1
