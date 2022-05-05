from datetime import date, timedelta

import pytest
from common.tests.conftest import *  # noqa
from common.tests.conftest import get_client_user
from companies.tests.conftest import *  # noqa
from django.conf import settings
from django.urls import reverse
from helsinkibenefit.tests.conftest import *  # noqa
from terms.enums import TermsType
from terms.models import Terms
from terms.tests.factories import TermsFactory, TermsOfServiceApprovalFactory
from users.utils import get_company_from_request


def get_current_user_url():
    return "/v1/users/me/"


def test_terms_of_service_in_effect(
    api_client, mock_get_organisation_roles_and_create_company
):
    """
    Test that the API returns the correct Terms and ApplicantConsents in the terms_of_service_in_effect field.
    """
    current_terms = TermsFactory(
        effective_from=date.today(), terms_type=TermsType.TERMS_OF_SERVICE
    )

    # Create some extra terms that should not be returned
    # ... old terms
    TermsFactory(
        effective_from=date.today() - timedelta(days=1),
        terms_type=TermsType.TERMS_OF_SERVICE,
    )
    # ... future terms
    TermsFactory(
        effective_from=date.today() + timedelta(days=1),
        terms_type=TermsType.TERMS_OF_SERVICE,
    )
    # ... wrong type of terms
    TermsFactory(effective_from=date.today(), terms_type=TermsType.APPLICANT_TERMS)
    response = api_client.get(get_current_user_url())

    assert (
        get_company_from_request(response.wsgi_request)
        == mock_get_organisation_roles_and_create_company
    )
    assert response.data["terms_of_service_in_effect"]["id"] == str(current_terms.pk)
    assert response.data["terms_of_service_in_effect"]["terms_pdf_fi"].startswith(
        "http"
    )

    assert {
        obj["id"]
        for obj in response.data["terms_of_service_in_effect"]["applicant_consents"]
    } == {str(obj.pk) for obj in current_terms.applicant_consents.all()}

    assert response.status_code == 200


@pytest.mark.parametrize("previously_approved", [False, True])
def test_approve_terms_success(
    api_client,
    terms_of_service,
    previously_approved,
    mock_get_organisation_roles_and_create_company,
):
    if previously_approved:
        # Handle case where user has previously approved terms, but new terms are now in effect.
        previous_terms = TermsFactory(
            effective_from=terms_of_service.effective_from - timedelta(days=10)
        )
        TermsOfServiceApprovalFactory(
            company=mock_get_organisation_roles_and_create_company,
            user=get_client_user(api_client),
            terms=previous_terms,
        )

    data = {
        "terms": terms_of_service.pk,
        "selected_applicant_consents": [
            obj.pk for obj in terms_of_service.applicant_consents.all()
        ],
    }

    assert settings.TERMS_OF_SERVICE_SESSION_KEY not in api_client.session

    response = api_client.post(
        "/v1/terms/approve_terms_of_service/",
        data,
    )
    assert response.status_code == 200
    assert response.data["terms"]["id"] == str(terms_of_service.pk)
    assert api_client.session[settings.TERMS_OF_SERVICE_SESSION_KEY]
    approval = get_client_user(api_client).terms_of_service_approvals.get(
        terms=terms_of_service
    )
    assert {obj.pk for obj in approval.selected_applicant_consents.all()} == {
        obj.pk for obj in terms_of_service.applicant_consents.all()
    }


def test_approve_wrong_terms(
    api_client, mock_get_organisation_roles_and_create_company
):
    # current terms
    TermsFactory(effective_from=date.today(), terms_type=TermsType.TERMS_OF_SERVICE)
    old_terms = TermsFactory(
        effective_from=date.today() - timedelta(days=1),
        terms_type=TermsType.TERMS_OF_SERVICE,
    )

    data = {
        "terms": old_terms.pk,
        "selected_applicant_consents": [
            obj.pk for obj in old_terms.applicant_consents.all()
        ],
    }

    response = api_client.post(
        "/v1/terms/approve_terms_of_service/",
        data,
    )
    assert response.status_code == 400
    assert "Only the terms currently in effect can be approved" in str(
        response.data["terms"]
    )


def test_approve_no_terms(api_client, mock_get_organisation_roles_and_create_company):
    # current terms
    TermsFactory(effective_from=date.today(), terms_type=TermsType.TERMS_OF_SERVICE)
    response = api_client.post(
        "/v1/terms/approve_terms_of_service/",
        {},
    )
    assert response.status_code == 400
    assert response.data.keys() == {"terms", "selected_applicant_consents"}


def test_approve_terms_missing_consent(
    api_client, terms_of_service, mock_get_organisation_roles_and_create_company
):
    data = {
        "terms": terms_of_service.pk,
        "selected_applicant_consents": [
            obj.pk for obj in terms_of_service.applicant_consents.all()
        ][1:],
    }

    response = api_client.post(
        "/v1/terms/approve_terms_of_service/",
        data,
    )
    assert response.status_code == 400
    assert "must explicitly select all the applicant consents required" in str(
        response.data["selected_applicant_consents"]
    )


def test_approve_terms_too_many_consents(
    api_client,
    terms_of_service,
    mock_get_organisation_roles_and_create_company,
):
    other_terms = TermsFactory(effective_from=None)
    consents = [obj.pk for obj in terms_of_service.applicant_consents.all()] + [
        obj.pk for obj in other_terms.applicant_consents.all()
    ]
    data = {
        "terms": terms_of_service.pk,
        "selected_applicant_consents": consents,
    }
    response = api_client.post(
        "/v1/terms/approve_terms_of_service/",
        data,
    )
    assert response.status_code == 400
    assert "must explicitly select all the applicant consents required" in str(
        response.data["selected_applicant_consents"]
    )


def test_validate_tos_approval_by_session(
    api_client,
    terms_of_service,
    mock_get_organisation_roles_and_create_company,
    bf_user,
):
    # This should be declined because use hasn't accept TOS yet
    response = api_client.get(reverse("v1:applicant-application-list"))

    assert response.status_code == 403
    assert (
        str(response.data["detail"])
        == "You have to accept Terms of Service before doing any action"
    )
    data = {
        "terms": terms_of_service.pk,
        "selected_applicant_consents": [
            obj.pk for obj in terms_of_service.applicant_consents.all()
        ],
    }

    assert settings.TERMS_OF_SERVICE_SESSION_KEY not in api_client.session

    response = api_client.post(
        "/v1/terms/approve_terms_of_service/",
        data,
    )
    assert response.status_code == 200
    assert response.data["terms"]["id"] == str(terms_of_service.pk)
    assert api_client.session[settings.TERMS_OF_SERVICE_SESSION_KEY]

    approval = get_client_user(api_client).terms_of_service_approvals.get(
        terms=terms_of_service
    )

    assert {obj.pk for obj in approval.selected_applicant_consents.all()} == {
        obj.pk for obj in terms_of_service.applicant_consents.all()
    }

    # Now applications request should be OK
    response = api_client.get(reverse("v1:applicant-application-list"))
    assert response.status_code == 200

    # Now effective TOS change
    assert terms_of_service == Terms.objects.get_terms_in_effect(
        TermsType.TERMS_OF_SERVICE
    )
    terms_of_service.effective_from = date.today() - timedelta(weeks=1)
    terms_of_service.save()
    new_term_of_service = TermsFactory(
        effective_from=date.today(), terms_type=TermsType.TERMS_OF_SERVICE
    )
    assert new_term_of_service == Terms.objects.get_terms_in_effect(
        TermsType.TERMS_OF_SERVICE
    )
    # Applications request should be still OK
    response = api_client.get(reverse("v1:applicant-application-list"))
    assert response.status_code == 200
    # Until the session is gone
    api_client.logout()
    api_client.force_authenticate(bf_user)
    response = api_client.get(reverse("v1:applicant-application-list"))
    assert response.status_code == 403
    assert (
        str(response.data["detail"])
        == "You have to accept Terms of Service before doing any action"
    )
