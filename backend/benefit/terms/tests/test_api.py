from datetime import date, timedelta

import pytest
from applications.api.v1.serializers import ApplicantApplicationSerializer
from applications.enums import ApplicationStatus
from applications.tests.conftest import *  # noqa
from applications.tests.test_applications_api import (
    add_attachments_to_application,
    get_detail_url,
)
from common.tests.conftest import *  # noqa
from helsinkibenefit.tests.conftest import *  # noqa
from terms.enums import TermsType
from terms.tests.factories import ApplicantTermsApprovalFactory, TermsFactory


def test_applicant_terms_in_effect(api_client, application, accept_tos):
    """
    Test that the API returns the correct Terms and ApplicantConsents in the applicant_terms_in_effect field.
    """
    current_terms = TermsFactory(
        effective_from=date.today(), terms_type=TermsType.APPLICANT_TERMS
    )

    # Create some extra terms that should not be returned
    # ... old terms
    TermsFactory(
        effective_from=date.today() - timedelta(days=1),
        terms_type=TermsType.APPLICANT_TERMS,
    )
    # ... future terms
    TermsFactory(
        effective_from=date.today() + timedelta(days=1),
        terms_type=TermsType.APPLICANT_TERMS,
    )

    response = api_client.get(get_detail_url(application))
    assert response.data["applicant_terms_in_effect"]["id"] == str(current_terms.pk)

    assert {
        obj["id"]
        for obj in response.data["applicant_terms_in_effect"]["applicant_consents"]
    } == {str(obj.pk) for obj in current_terms.applicant_consents.all()}

    assert response.data["applicant_terms_in_effect"]["terms_pdf_fi"].startswith("http")
    assert response.data["applicant_terms_approval_needed"] is True
    assert response.status_code == 200


@pytest.mark.parametrize(
    "from_status,to_status,status_visible_to_applicant",
    [
        (
            ApplicationStatus.DRAFT,
            ApplicationStatus.RECEIVED,
            ApplicationStatus.HANDLING,
        ),
        (
            ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED,
            ApplicationStatus.HANDLING,
            ApplicationStatus.HANDLING,
        ),
    ],
)
@pytest.mark.parametrize("previously_approved", [False, True])
def test_approve_terms_success(
    api_client,
    request,
    application,
    applicant_terms,
    from_status,
    to_status,
    status_visible_to_applicant,
    previously_approved,
):
    application.status = from_status
    application.save()
    if previously_approved:
        # Handle case where user has previously approved terms, but new terms are now in effect.
        previous_terms = TermsFactory(
            effective_from=applicant_terms.effective_from - timedelta(days=10)
        )
        application.applicant_terms_approval = ApplicantTermsApprovalFactory(
            application=application, terms=previous_terms
        )
    add_attachments_to_application(
        request, application
    )  # so that attachment validation passes

    data = ApplicantApplicationSerializer(application).data

    assert data["applicant_terms_approval_needed"] is True
    data["approve_terms"] = {
        "terms": applicant_terms.pk,
        "selected_applicant_consents": [
            obj.pk for obj in applicant_terms.applicant_consents.all()
        ],
    }
    data["status"] = to_status

    response = api_client.put(
        get_detail_url(application),
        data,
    )
    application.refresh_from_db()
    assert application.status == to_status
    assert response.status_code == 200
    assert response.data["applicant_terms_approval_needed"] is False
    assert response.data["status"] == status_visible_to_applicant
    assert response.data["applicant_terms_approval"]["terms"]["id"] == str(
        applicant_terms.pk
    )
    assert {
        obj["id"]
        for obj in response.data["applicant_terms_approval"][
            "selected_applicant_consents"
        ]
    } == {str(obj.pk) for obj in applicant_terms.applicant_consents.all()}


@pytest.mark.parametrize(
    "from_status,to_status",
    [
        (ApplicationStatus.DRAFT, ApplicationStatus.RECEIVED),
        (ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED, ApplicationStatus.HANDLING),
    ],
)
def test_approve_wrong_terms(api_client, request, application, from_status, to_status):
    # current terms
    TermsFactory(effective_from=date.today(), terms_type=TermsType.APPLICANT_TERMS)
    old_terms = TermsFactory(
        effective_from=date.today() - timedelta(days=1),
        terms_type=TermsType.APPLICANT_TERMS,
    )
    application.status = from_status
    application.save()
    add_attachments_to_application(
        request, application
    )  # so that attachment validation passes

    data = ApplicantApplicationSerializer(application).data
    assert data["applicant_terms_approval_needed"] is True
    data["approve_terms"] = {
        "terms": old_terms.pk,
        "selected_applicant_consents": [
            obj.pk for obj in old_terms.applicant_consents.all()
        ],
    }
    data["status"] = to_status

    response = api_client.put(
        get_detail_url(application),
        data,
    )
    application.refresh_from_db()
    assert response.status_code == 400
    assert "Only the terms currently in effect can be approved" in str(
        response.data["approve_terms"]["terms"]
    )


@pytest.mark.parametrize(
    "from_status,to_status",
    [
        (ApplicationStatus.DRAFT, ApplicationStatus.RECEIVED),
        (ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED, ApplicationStatus.HANDLING),
    ],
)
def test_approve_no_terms(api_client, request, application, from_status, to_status):
    # current terms
    TermsFactory(effective_from=date.today(), terms_type=TermsType.APPLICANT_TERMS)
    application.status = from_status
    application.save()
    add_attachments_to_application(
        request, application
    )  # so that attachment validation passes

    data = ApplicantApplicationSerializer(application).data
    assert data["applicant_terms_approval_needed"] is True
    assert "approve_terms" not in data  # no approve_terms
    data["status"] = to_status

    response = api_client.put(
        get_detail_url(application),
        data,
    )
    application.refresh_from_db()
    assert response.status_code == 400
    assert "Terms must be approved" in response.data["approve_terms"]


@pytest.mark.parametrize(
    "status",
    [
        ApplicationStatus.DRAFT,
        ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED,
    ],
)
def test_approve_terms_missing_consent(
    api_client, request, application, applicant_terms, status
):
    application.status = status
    application.save()
    add_attachments_to_application(
        request, application
    )  # so that attachment validation passes

    data = ApplicantApplicationSerializer(application).data
    data["approve_terms"] = {
        "terms": applicant_terms.pk,
        "selected_applicant_consents": [
            obj.pk for obj in applicant_terms.applicant_consents.all()
        ][1:],
    }
    data["status"] = ApplicationStatus.RECEIVED

    response = api_client.put(
        get_detail_url(application),
        data,
    )
    application.refresh_from_db()
    assert response.status_code == 400
    assert "must explicitly select all the applicant consents required" in str(
        response.data["approve_terms"]["selected_applicant_consents"]
    )


@pytest.mark.parametrize(
    "status",
    [
        ApplicationStatus.DRAFT,
        ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED,
    ],
)
def test_approve_terms_too_many_consents(
    api_client, request, application, applicant_terms, status
):
    application.status = status
    application.save()
    add_attachments_to_application(
        request, application
    )  # so that attachment validation passes
    other_terms = TermsFactory(effective_from=None)
    data = ApplicantApplicationSerializer(application).data
    consents = [obj.pk for obj in applicant_terms.applicant_consents.all()] + [
        obj.pk for obj in other_terms.applicant_consents.all()
    ]
    data["approve_terms"] = {
        "terms": applicant_terms.pk,
        "selected_applicant_consents": consents,
    }
    data["status"] = ApplicationStatus.RECEIVED

    response = api_client.put(
        get_detail_url(application),
        data,
    )
    application.refresh_from_db()
    assert response.status_code == 400
    assert "must explicitly select all the applicant consents required" in str(
        response.data["approve_terms"]["selected_applicant_consents"]
    )


@pytest.mark.parametrize(
    "from_status, to_status",
    [
        (ApplicationStatus.DRAFT, ApplicationStatus.DRAFT),
        (
            ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED,
            ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED,
        ),
    ],
)
def test_approve_terms_ignored_when_not_submitting_application(
    api_client, request, application, applicant_terms, from_status, to_status
):
    """
    When the application is not being submitted, then any terms_approval in the request is ignored
    """
    application.status = from_status
    application.save()
    add_attachments_to_application(
        request, application
    )  # so that attachment validation passes

    data = ApplicantApplicationSerializer(application).data

    assert data["applicant_terms_approval_needed"] is True
    data["approve_terms"] = {
        "terms": applicant_terms.pk,
        "selected_applicant_consents": [
            obj.pk for obj in applicant_terms.applicant_consents.all()
        ],
    }
    data["status"] = to_status

    response = api_client.put(
        get_detail_url(application),
        data,
    )
    application.refresh_from_db()
    assert response.status_code == 200
    assert response.data["applicant_terms_approval_needed"] is True
    assert response.data["status"] == to_status
    assert response.data["applicant_terms_approval"] is None
