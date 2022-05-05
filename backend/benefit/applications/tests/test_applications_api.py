import copy
import json
import os
import re
import tempfile
from datetime import date, datetime
from decimal import Decimal
from unittest import mock

import faker
import pytest
import pytz
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from freezegun import freeze_time
from PIL import Image
from rest_framework.reverse import reverse
from shared.audit_log import models as audit_models
from shared.service_bus.enums import YtjOrganizationCode

from applications.api.v1.serializers import (
    ApplicantApplicationSerializer,
    AttachmentSerializer,
    HandlerApplicationSerializer,
)
from applications.api.v1.status_transition_validator import (
    ApplicantApplicationStatusValidator,
)
from applications.api.v1.views import BaseApplicationViewSet
from applications.enums import (
    ApplicationStatus,
    ApplicationStep,
    AttachmentType,
    BenefitType,
    OrganizationType,
)
from applications.models import Application, ApplicationLogEntry, Attachment, Employee
from applications.tests.conftest import *  # noqa
from applications.tests.factories import (
    ApplicationBatchFactory,
    ApplicationFactory,
    DecidedApplicationFactory,
    HandlingApplicationFactory,
    ReceivedApplicationFactory,
)
from calculator.models import Calculation
from calculator.tests.conftest import fill_empty_calculation_fields
from common.tests.conftest import *  # noqa
from common.tests.conftest import get_client_user
from common.utils import duration_in_months
from companies.tests.conftest import *  # noqa
from companies.tests.factories import CompanyFactory
from helsinkibenefit.settings import MAX_UPLOAD_SIZE
from helsinkibenefit.tests.conftest import *  # noqa
from terms.models import TermsOfServiceApproval
from terms.tests.conftest import *  # noqa


def get_detail_url(application):
    return reverse("v1:applicant-application-detail", kwargs={"pk": application.id})


def get_handler_detail_url(application):
    return reverse("v1:handler-application-detail", kwargs={"pk": application.id})


@pytest.mark.parametrize(
    "view_name",
    [
        "v1:applicant-application-list",
        "v1:handler-application-list",
        "v1:applicant-application-simplified-application-list",
        "v1:handler-application-simplified-application-list",
    ],
)
def test_applications_unauthenticated(anonymous_client, application, view_name):
    response = anonymous_client.get(reverse(view_name))
    assert response.status_code == 403
    audit_event = (
        audit_models.AuditLogEntry.objects.all().first().message["audit_event"]
    )
    assert audit_event["status"] == "FORBIDDEN"
    assert audit_event["operation"] == "READ"
    assert audit_event["target"]["id"] == ""
    assert audit_event["target"]["type"] == "Application"


@pytest.mark.parametrize(
    "view_name",
    [
        "v1:applicant-application-list",
        "v1:applicant-application-simplified-application-list",
    ],
)
def test_applications_unauthorized(
    api_client,
    anonymous_application,
    view_name,
    mock_get_organisation_roles_and_create_company,
):
    response = api_client.get(reverse(view_name))
    assert len(response.data) == 0
    assert response.status_code == 200


def test_applications_list(api_client, application):
    response = api_client.get(reverse("v1:applicant-application-list"))
    assert len(response.data) == 1
    assert response.status_code == 200


def test_applications_list_with_filter(api_client, application):
    application.status = ApplicationStatus.DRAFT
    application.save()
    url1 = reverse("v1:applicant-application-list") + "?status=draft"
    response = api_client.get(url1)
    assert len(response.data) == 1
    assert response.status_code == 200

    url2 = reverse("v1:applicant-application-list") + "?status=cancelled"
    response = api_client.get(url2)
    assert len(response.data) == 0
    assert response.status_code == 200

    url3 = reverse("v1:applicant-application-list") + "?status=cancelled,draft"
    response = api_client.get(url3)
    assert len(response.data) == 1
    assert response.status_code == 200


def test_applications_filter_by_batch(
    handler_api_client, application_batch, application
):
    application_batch.applications.all().update(company=application.company)
    url = reverse("v1:handler-application-list") + f"?batch={application_batch.pk}"
    response = handler_api_client.get(url)
    assert len(response.data) == 2
    assert response.status_code == 200


def test_applications_filter_by_ssn(api_client, application, association_application):
    assert (
        application.employee.social_security_number
        != association_application.employee.social_security_number
    )
    url = (
        reverse("v1:applicant-application-list")
        + f"?employee__social_security_number={application.employee.social_security_number}"
    )
    response = api_client.get(url)
    assert len(response.data) == 1
    assert response.data[0]["id"] == str(application.id)
    assert response.status_code == 200


def test_applications_simple_list_as_handler(handler_api_client, received_application):
    response = handler_api_client.get(
        reverse("v1:handler-application-simplified-application-list")
    )
    assert len(response.data) == 1
    assert response.status_code == 200
    for key in BaseApplicationViewSet.EXCLUDE_FIELDS_FROM_SIMPLE_LIST:
        assert key not in response.data[0]
    for key in ["calculation", "handled_at"]:
        # handler-only fields must still be found
        assert key in response.data[0]


def test_applications_simple_list_as_applicant(api_client, received_application):
    response = api_client.get(
        reverse("v1:applicant-application-simplified-application-list")
    )
    assert len(response.data) == 1
    assert response.status_code == 200
    for key in BaseApplicationViewSet.EXCLUDE_FIELDS_FROM_SIMPLE_LIST:
        assert key not in response.data
    for key in ["calculation", "handled_at"]:
        # handler-specific fields must not appear
        assert key not in response.data[0]


@pytest.mark.parametrize(
    "exclude_fields",
    [
        ("status",),
        (
            "status",
            "last_modified_at",
        ),
        ("status", "last_modified_at", "employee"),
    ],
)
def test_applications_simple_list_exclude_more(
    handler_api_client, received_application, exclude_fields
):
    response = handler_api_client.get(
        reverse("v1:handler-application-simplified-application-list")
        + f"?exclude_fields={','.join(exclude_fields)}"
    )
    assert len(response.data) == 1
    assert response.status_code == 200
    for key in exclude_fields:
        assert key not in response.data[0]
    for key in BaseApplicationViewSet.EXCLUDE_FIELDS_FROM_SIMPLE_LIST:
        assert key not in response.data[0]


def test_applications_simple_list_filter(
    handler_api_client, received_application, handling_application
):
    response = handler_api_client.get(
        reverse("v1:handler-application-simplified-application-list")
        + "?status=handling"
    )
    assert len(response.data) == 1
    for key in BaseApplicationViewSet.EXCLUDE_FIELDS_FROM_SIMPLE_LIST:
        assert key not in response.data
    assert response.data[0]["status"] == "handling"
    assert response.status_code == 200


@pytest.mark.parametrize("url_func", [get_detail_url, get_handler_detail_url])
def test_application_single_read_unauthenticated(
    anonymous_client, application, url_func
):
    response = anonymous_client.get(url_func(application))
    assert response.status_code == 403


def test_application_single_read_unauthorized(
    api_client, anonymous_application, mock_get_organisation_roles_and_create_company
):
    response = api_client.get(get_detail_url(anonymous_application))
    assert response.status_code == 404


@pytest.mark.parametrize(
    "actual_status, visible_status",
    [
        (ApplicationStatus.DRAFT, ApplicationStatus.DRAFT),
        (
            ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED,
            ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED,
        ),
        (ApplicationStatus.RECEIVED, ApplicationStatus.HANDLING),
        (ApplicationStatus.HANDLING, ApplicationStatus.HANDLING),
        (ApplicationStatus.ACCEPTED, ApplicationStatus.HANDLING),
        (ApplicationStatus.REJECTED, ApplicationStatus.HANDLING),
        (ApplicationStatus.CANCELLED, ApplicationStatus.CANCELLED),
    ],
)
def test_application_single_read_as_applicant(
    api_client, application, actual_status, visible_status
):
    application.status = actual_status
    application.save()
    response = api_client.get(get_detail_url(application))
    assert response.data["ahjo_decision"] is None
    assert response.data["application_number"] is not None
    assert response.data["status"] == visible_status
    assert "batch" not in response.data
    assert Decimal(response.data["duration_in_months_rounded"]) == duration_in_months(
        application.start_date, application.end_date, decimal_places=2
    )
    assert response.status_code == 200


@pytest.mark.parametrize(
    "status, expected_result",
    [
        (ApplicationStatus.DRAFT, 404),
        (ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED, 200),
        (ApplicationStatus.RECEIVED, 200),
        (ApplicationStatus.HANDLING, 200),
        (ApplicationStatus.ACCEPTED, 200),
        (ApplicationStatus.REJECTED, 200),
        (ApplicationStatus.CANCELLED, 200),
    ],
)
def test_application_single_read_as_handler(
    handler_api_client, application, status, expected_result
):
    application.status = status
    application.save()
    response = handler_api_client.get(get_handler_detail_url(application))
    assert response.status_code == expected_result
    if response.status_code == 200:
        assert response.data["ahjo_decision"] is None
        assert response.data["application_number"] is not None
        assert "batch" in response.data


def test_application_submitted_at(
    api_client, application, received_application, handling_application
):
    response = api_client.get(get_detail_url(application))
    assert response.data["submitted_at"] is None
    response = api_client.get(get_detail_url(received_application))
    assert response.data["submitted_at"].isoformat() == "2021-06-04T00:00:00+00:00"
    response = api_client.get(get_detail_url(handling_application))
    assert response.data["submitted_at"].isoformat() == "2021-06-04T00:00:00+00:00"


def test_application_template(api_client):
    response = api_client.get(
        reverse("v1:applicant-application-get-application-template")
    )
    assert (
        len(response.data["de_minimis_aid_set"]) == 0
    )  # as of 2021-06-16, just a dummy implementation exists


def test_application_post_success_unauthenticated(anonymous_client, application):
    data = ApplicantApplicationSerializer(application).data
    application.delete()
    assert len(Application.objects.all()) == 0

    del data["id"]  # id is read-only field and would be ignored
    response = anonymous_client.post(
        reverse("v1:applicant-application-list"),
        data,
    )
    assert response.status_code == 403
    audit_event = (
        audit_models.AuditLogEntry.objects.all().first().message["audit_event"]
    )
    assert audit_event["status"] == "FORBIDDEN"
    assert audit_event["operation"] == "CREATE"
    assert audit_event["target"]["id"] == ""
    assert audit_event["target"]["type"] == "Application"


def test_application_post_success(api_client, application):
    """
    Create a new application
    """
    data = ApplicantApplicationSerializer(application).data
    application.delete()
    assert len(Application.objects.all()) == 0

    del data["id"]  # id is read-only field and would be ignored
    response = api_client.post(
        reverse("v1:applicant-application-list"),
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
    assert datetime.fromisoformat(data["created_at"]) == datetime(
        2021, 6, 4, tzinfo=pytz.UTC
    )
    assert new_application.application_step == data["application_step"]
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
        new_application.company_form_code == new_application.company.company_form_code
    )
    assert (
        new_application.official_company_street_address
        == new_application.company.street_address
    )
    assert new_application.official_company_postcode == new_application.company.postcode
    assert new_application.official_company_city == new_application.company.city
    audit_event = (
        audit_models.AuditLogEntry.objects.all().first().message["audit_event"]
    )
    assert audit_event["status"] == "SUCCESS"
    assert audit_event["target"]["id"] == str(Application.objects.all().first().id)
    assert audit_event["operation"] == "CREATE"


def test_application_post_unfinished(api_client, application):
    """
    Create a new application with partial information
    like when hitting "save as draft" without entering any fields
    """

    data = ApplicantApplicationSerializer(application).data
    application.delete()
    assert len(Application.objects.all()) == 0
    assert len(Employee.objects.all()) == 0

    for dict_object in [data, data["employee"]]:
        for key, item in dict_object.items():
            if key in [
                "status",
                "applicant_language",
                "archived",
                "use_alternative_address",
                "is_living_in_helsinki",
                "application_step",
            ]:
                # field can't be empty/null
                pass
            elif key in ["start_date", "end_date"]:
                dict_object[key] = None
            elif isinstance(item, list):
                dict_object[key] = []
            elif isinstance(item, str):
                dict_object[key] = ""
            elif isinstance(item, bool):
                dict_object[key] = None

    response = api_client.post(
        reverse("v1:applicant-application-list"),
        data,
    )
    assert response.status_code == 201
    application = Application.objects.get(pk__isnull=False)
    assert len(application.de_minimis_aid_set.all()) == 0
    assert application.benefit_type == ""
    assert application.start_date is None
    assert (
        application.employee.employee_language == data["employee"]["employee_language"]
    )
    assert (
        application.employee.is_living_in_helsinki
        == data["employee"]["is_living_in_helsinki"]
    )


@pytest.mark.parametrize(
    "language,company_bank_account_number_validation_error",
    [
        ("en", "Invalid IBAN"),
        ("fi", "Virheellinen IBAN-tilinumero"),
        ("sv", "Felaktigt IBAN-kontonummer"),
    ],
)
def test_application_post_invalid_data(
    api_client, application, language, company_bank_account_number_validation_error
):
    data = ApplicantApplicationSerializer(application).data
    application.delete()
    assert len(Application.objects.all()) == 0

    del data["id"]
    data["de_minimis_aid_set"][0]["amount"] = "300000.00"  # value too high
    data["status"] = "foo"  # invalid value
    data["bases"] = ["something_completely_different"]  # invalid value
    data["applicant_language"] = None  # non-null required
    data["company_bank_account_number"] = "FI91 4008 0282 0002 02"  # invalid number

    data[
        "company_contact_person_phone_number"
    ] = "+359505658789"  # Invalid country code

    api_client.defaults["HTTP_ACCEPT_LANGUAGE"] = language
    response = api_client.post(
        reverse("v1:applicant-application-list"), data, format="json"
    )
    assert response.status_code == 400
    assert response.data.keys() == {
        "status",
        "bases",
        "applicant_language",
        "company_contact_person_phone_number",
        "de_minimis_aid_set",
        "company_bank_account_number",
    }
    assert (
        str(response.data["company_bank_account_number"][0])
        == company_bank_account_number_validation_error
    )
    assert len(response.data["company_bank_account_number"]) == 1
    assert response.data["de_minimis_aid_set"][0].keys() == {"amount"}
    assert len(response.data["de_minimis_aid_set"]) == 2


def test_application_post_invalid_employee_data(api_client, application):
    data = ApplicantApplicationSerializer(application).data
    application.delete()
    assert len(Application.objects.all()) == 0

    del data["id"]
    data["employee"]["monthly_pay"] = "30000000.00"  # value too high
    data["employee"]["social_security_number"] = "080597-953X"  # invalid checksum
    data["employee"]["employee_language"] = None  # non-null required
    data["employee"]["phone_number"] = "+359505658789"  # Invalid country code
    data["employee"]["working_hours"] = 16  # Must be > 18 hour per weeek
    data["employee"]["vacation_money"] = -1  # Must be >= 0
    data["employee"]["other_expenses"] = -1  # Must be >= 0
    response = api_client.post(
        reverse("v1:applicant-application-list"), data, format="json"
    )
    assert response.status_code == 400
    assert response.data.keys() == {"employee"}
    assert response.data["employee"].keys() == {
        "monthly_pay",
        "phone_number",
        "social_security_number",
        "employee_language",
        "working_hours",
        "vacation_money",
        "other_expenses",
    }

    data["employee"]["monthly_pay"] = 0  # Zero salary
    response = api_client.post(
        reverse("v1:applicant-application-list"), data, format="json"
    )
    assert response.status_code == 400
    assert response.data.keys() == {"employee"}
    assert (
        "monthly_pay" in response.data["employee"].keys()
    )  # Check if the error still there


def test_application_put_edit_fields_unauthenticated(anonymous_client, application):
    data = ApplicantApplicationSerializer(application).data
    data["company_contact_person_phone_number"] = "+358505658789"
    response = anonymous_client.put(
        get_detail_url(application),
        data,
    )
    assert response.status_code == 403


def test_application_put_edit_fields_unauthorized(
    api_client, anonymous_application, mock_get_organisation_roles_and_create_company
):
    data = ApplicantApplicationSerializer(anonymous_application).data
    data["company_contact_person_phone_number"] = "+358505658789"
    response = api_client.put(
        get_detail_url(anonymous_application),
        data,
    )
    assert response.status_code == 404
    audit_event = (
        audit_models.AuditLogEntry.objects.all().first().message["audit_event"]
    )
    assert audit_event["status"] == "FORBIDDEN"
    assert audit_event["target"]["id"] == str(anonymous_application.id)
    assert audit_event["operation"] == "UPDATE"


def test_application_put_edit_fields(api_client, application):
    """
    modify existing application
    """
    data = ApplicantApplicationSerializer(application).data
    data["company_contact_person_phone_number"] = "+358505658789"
    response = api_client.put(
        get_detail_url(application),
        data,
    )
    assert response.status_code == 200
    assert (
        response.data["company_contact_person_phone_number"] == "0505658789"
    )  # normalized format
    application.refresh_from_db()
    assert application.company_contact_person_phone_number == "0505658789"
    audit_event = (
        audit_models.AuditLogEntry.objects.all().first().message["audit_event"]
    )
    assert audit_event["status"] == "SUCCESS"
    assert audit_event["target"]["id"] == str(application.id)
    assert audit_event["operation"] == "UPDATE"


def test_application_put_edit_employee(api_client, application):
    """
    modify existing application
    """
    data = ApplicantApplicationSerializer(application).data
    data["employee"]["phone_number"] = "0505658789"
    data["employee"]["social_security_number"] = "080597-953Y"
    old_employee_pk = application.employee.pk
    response = api_client.put(
        get_detail_url(application),
        data,
    )
    assert response.status_code == 200
    assert (
        response.data["employee"]["phone_number"] == "0505658789"
    )  # normalized format
    application.refresh_from_db()
    assert application.employee.phone_number == "+358505658789"
    assert application.employee.social_security_number == "080597-953Y"
    assert old_employee_pk == application.employee.pk


def test_application_put_read_only_fields(api_client, application):
    """
    company info that is retrieved from official (YTJ or other) sources is not editable by applicant/handler
    Also, the company of the application can not be changed.
    """
    another_company = CompanyFactory()
    data = ApplicantApplicationSerializer(application).data
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


def test_application_put_invalid_data(api_client, application):
    data = ApplicantApplicationSerializer(application).data
    data["de_minimis_aid_set"][0]["amount"] = "300000.00"  # value too high
    data[
        "status"
    ] = ApplicationStatus.ACCEPTED  # invalid value when transitioning from draft
    data["bases"] = ["something_completely_different"]  # invalid value
    data["applicant_language"] = None  # non-null required
    response = api_client.put(
        get_detail_url(application),
        data,
    )
    assert response.status_code == 400
    assert response.data.keys() == {
        "status",
        "bases",
        "applicant_language",
        "de_minimis_aid_set",
    }
    assert response.data["de_minimis_aid_set"][0].keys() == {"amount"}
    assert len(response.data["de_minimis_aid_set"]) == 2


def test_application_replace_de_minimis_aid(api_client, application):
    data = ApplicantApplicationSerializer(application).data

    data["de_minimis_aid"] = True
    data["de_minimis_aid_set"] = [
        {
            "granter": "aaa",
            "granted_at": date.today().isoformat(),
            "amount": "12345.00",
        }
    ]
    response = api_client.put(
        get_detail_url(application),
        data,
    )
    assert response.status_code == 200
    application.refresh_from_db()
    new_data = ApplicantApplicationSerializer(application).data
    del new_data["de_minimis_aid_set"][0]["id"]
    assert new_data["de_minimis_aid_set"][0]["ordering"] == 0
    del new_data["de_minimis_aid_set"][0]["ordering"]
    assert new_data["de_minimis_aid_set"] == data["de_minimis_aid_set"]


def test_application_edit_de_minimis_aid(api_client, application):
    data = ApplicantApplicationSerializer(application).data

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
    data = ApplicantApplicationSerializer(application).data

    data["de_minimis_aid"] = False
    data["de_minimis_aid_set"] = []

    response = api_client.put(
        get_detail_url(application),
        data,
    )
    assert response.status_code == 200
    assert response.data["de_minimis_aid_set"] == []


def test_application_edit_de_minimis_aid_too_high(api_client, application):
    data = ApplicantApplicationSerializer(application).data

    previous_aid = copy.deepcopy(data["de_minimis_aid_set"])
    data["de_minimis_aid"] = True
    data["de_minimis_aid_set"][0]["amount"] = "150000"
    data["de_minimis_aid_set"][1]["amount"] = "50001"

    response = api_client.put(
        get_detail_url(application),
        data,
    )
    assert response.status_code == 400

    application.refresh_from_db()
    data_after = ApplicantApplicationSerializer(application).data
    assert previous_aid == data_after["de_minimis_aid_set"]


def test_application_edit_benefit_type_business(api_client, application):
    data = ApplicantApplicationSerializer(application).data
    data["benefit_type"] = BenefitType.EMPLOYMENT_BENEFIT
    data["apprenticeship_program"] = False
    data["pay_subsidy_granted"] = True
    data["pay_subsidy_percent"] = 50
    response = api_client.put(
        get_detail_url(application),
        data,
    )
    assert response.status_code == 200
    assert set(response.data["available_benefit_types"]) == {
        BenefitType.SALARY_BENEFIT,
        BenefitType.COMMISSION_BENEFIT,
        BenefitType.EMPLOYMENT_BENEFIT,
    }


def test_application_edit_benefit_type_business_no_pay_subsidy(api_client, application):
    data = ApplicantApplicationSerializer(application).data
    data["benefit_type"] = BenefitType.EMPLOYMENT_BENEFIT
    data["apprenticeship_program"] = False
    data["pay_subsidy_granted"] = False
    data["pay_subsidy_percent"] = None
    response = api_client.put(
        get_detail_url(application),
        data,
    )
    assert response.status_code == 200
    assert set(response.data["available_benefit_types"]) == {
        BenefitType.COMMISSION_BENEFIT,
        BenefitType.EMPLOYMENT_BENEFIT,
    }


def test_application_edit_benefit_type_business_association(
    api_client, association_application, mock_get_organisation_roles_and_create_company
):
    data = ApplicantApplicationSerializer(association_application).data
    company = mock_get_organisation_roles_and_create_company
    company.company_form = "ry"
    company.company_form_code = YtjOrganizationCode.ASSOCIATION_FORM_CODE_DEFAULT
    company.save()
    association_application.company = company
    association_application.save()
    data["benefit_type"] = BenefitType.EMPLOYMENT_BENEFIT
    data["association_has_business_activities"] = True
    data["apprenticeship_program"] = False
    data["pay_subsidy_granted"] = True
    data["pay_subsidy_percent"] = 50

    response = api_client.put(
        get_detail_url(association_application),
        data,
    )
    assert response.status_code == 200
    assert set(response.data["available_benefit_types"]) == {
        BenefitType.SALARY_BENEFIT,
        BenefitType.COMMISSION_BENEFIT,
        BenefitType.EMPLOYMENT_BENEFIT,
    }


def test_application_edit_benefit_type_business_association_with_apprenticeship(
    api_client, association_application
):
    data = ApplicantApplicationSerializer(association_application).data
    data["benefit_type"] = BenefitType.EMPLOYMENT_BENEFIT
    data["association_has_business_activities"] = True
    data["apprenticeship_program"] = True
    data["pay_subsidy_granted"] = True
    data["pay_subsidy_percent"] = 50

    response = api_client.put(
        get_detail_url(association_application),
        data,
    )
    assert response.status_code == 200
    assert set(response.data["available_benefit_types"]) == {
        BenefitType.SALARY_BENEFIT,
        BenefitType.EMPLOYMENT_BENEFIT,
    }


def test_application_edit_benefit_type_non_business(
    api_client, association_application
):
    association_application.pay_subsidy_granted = True
    association_application.pay_subsidy_percent = 50
    association_application.save()
    data = ApplicantApplicationSerializer(association_application).data
    response = api_client.put(
        get_detail_url(association_application),
        data,
    )
    assert response.status_code == 200
    assert response.data["available_benefit_types"] == [
        BenefitType.SALARY_BENEFIT,
    ]


def test_application_edit_benefit_type_non_business_invalid(
    api_client, association_application
):
    association_application.pay_subsidy_granted = True
    association_application.pay_subsidy_percent = 50
    association_application.save()
    data = ApplicantApplicationSerializer(association_application).data
    data["benefit_type"] = BenefitType.EMPLOYMENT_BENEFIT

    response = api_client.put(
        get_detail_url(association_application),
        data,
    )
    assert response.status_code == 400


def test_association_immediate_manager_check_invalid(api_client, application):
    data = ApplicantApplicationSerializer(application).data
    data["association_immediate_manager_check"] = False  # invalid value
    response = api_client.put(
        get_detail_url(application),
        data,
    )
    assert response.status_code == 400


def test_association_immediate_manager_check_valid(api_client, association_application):
    data = ApplicantApplicationSerializer(association_application).data
    data["association_immediate_manager_check"] = True  # valid value for associations
    response = api_client.put(
        get_detail_url(association_application),
        data,
    )
    assert response.status_code == 200


@pytest.mark.django_db
def test_application_delete_unauthenticated(anonymous_client, application):
    response = anonymous_client.delete(get_detail_url(application))
    assert response.status_code == 403


@pytest.mark.django_db
def test_application_delete_unauthorized(
    api_client, anonymous_application, mock_get_organisation_roles_and_create_company
):
    response = api_client.delete(get_detail_url(anonymous_application))
    assert response.status_code == 404


@pytest.mark.django_db
def test_application_delete(api_client, application):
    response = api_client.delete(get_detail_url(application))
    assert len(Application.objects.all()) == 0
    assert len(Employee.objects.all()) == 0
    assert len(ApplicationLogEntry.objects.all()) == 0
    assert response.status_code == 204


@pytest.mark.parametrize(
    "benefit_type", [BenefitType.SALARY_BENEFIT, BenefitType.EMPLOYMENT_BENEFIT]
)
@pytest.mark.parametrize(
    "start_date,end_date,status_code",
    [
        ("2021-02-01", "2021-02-27", 400),  # too short
        ("2021-02-01", "2021-02-28", 200),  # exactly one month
        ("2021-02-01", "2022-01-31", 200),  # exactly 12 months
        ("2021-02-01", "2022-02-01", 400),  # too long
        (
            "2020-02-01",
            "2020-12-31",
            200,
        ),  # past year is allowed, as the application is not submitted
    ],
)
def test_application_date_range(
    api_client, application, benefit_type, start_date, end_date, status_code
):
    """
    modify existing application
    """
    data = ApplicantApplicationSerializer(application).data

    data["benefit_type"] = benefit_type
    data["start_date"] = start_date
    data["end_date"] = end_date
    data["pay_subsidy_granted"] = True
    data["pay_subsidy_percent"] = 50

    response = api_client.put(
        get_detail_url(application),
        data,
    )
    assert response.status_code == status_code
    if status_code == 200:
        assert response.data["start_date"] == start_date
        assert response.data["end_date"] == end_date


@pytest.mark.parametrize(
    "start_date,end_date,status_code",
    [
        (
            "2020-12-21",
            "2021-02-27",
            400,
        ),  # start_date in past (relative to freeze_time date)
        (
            "2021-01-01",
            "2021-02-28",
            200,
        ),  # start_date in current year (relative to freeze_time date)
        (
            "2022-12-31",
            "2023-01-31",
            200,
        ),  # start_date in next year (relative to freeze_time date)
    ],
)
def test_application_date_range_on_submit(
    request, api_client, application, start_date, end_date, status_code
):
    add_attachments_to_application(request, application)

    data = ApplicantApplicationSerializer(application).data

    data["start_date"] = start_date
    data["end_date"] = end_date
    data["pay_subsidy_granted"] = True
    data["pay_subsidy_percent"] = 50

    response = api_client.put(
        get_detail_url(application),
        data,
    )
    assert (
        response.status_code == 200
    )  # the values are valid while application is a draft
    assert response.data["start_date"] == start_date
    assert response.data["end_date"] == end_date
    application.refresh_from_db()
    submit_response = _submit_application(api_client, application)
    assert submit_response.status_code == status_code


@pytest.mark.parametrize(
    "company_form_code,de_minimis_aid,de_minimis_aid_set,association_has_business_activities,expected_result",
    [
        (YtjOrganizationCode.ASSOCIATION_FORM_CODE_DEFAULT, None, [], False, 200),
        (YtjOrganizationCode.ASSOCIATION_FORM_CODE_DEFAULT, False, [], False, 200),
        (YtjOrganizationCode.ASSOCIATION_FORM_CODE_DEFAULT, None, [], True, 200),
        (YtjOrganizationCode.ASSOCIATION_FORM_CODE_DEFAULT, False, [], True, 200),
        (YtjOrganizationCode.COMPANY_FORM_CODE_DEFAULT, None, [], None, 400),
        (YtjOrganizationCode.COMPANY_FORM_CODE_DEFAULT, False, [], None, 200),
    ],
)
def test_submit_application_without_de_minimis_aid(
    request,
    api_client,
    application,
    company_form_code,
    de_minimis_aid,
    de_minimis_aid_set,
    association_has_business_activities,
    expected_result,
):
    application.company.company_form_code = company_form_code
    application.company.save()
    add_attachments_to_application(request, application)

    data = ApplicantApplicationSerializer(application).data

    data["benefit_type"] = BenefitType.SALARY_BENEFIT
    data["de_minimis_aid"] = de_minimis_aid
    data["de_minimis_aid_set"] = de_minimis_aid_set
    data["pay_subsidy_percent"] = "50"
    data["pay_subsidy_granted"] = True
    data["association_has_business_activities"] = association_has_business_activities
    if company_form_code == YtjOrganizationCode.ASSOCIATION_FORM_CODE_DEFAULT:
        data["association_immediate_manager_check"] = True

    response = api_client.put(
        get_detail_url(application),
        data,
    )
    assert (
        response.status_code == 200
    )  # the values are valid while application is a draft
    application.refresh_from_db()
    submit_response = _submit_application(api_client, application)
    assert submit_response.status_code == expected_result


@pytest.mark.parametrize(
    "pay_subsidy_granted,apprenticeship_program,expected_result",
    [
        (True, True, 200),
        (True, False, 200),
        (True, None, 400),
        (False, None, 200),
    ],
)
def test_apprenticeship_program_validation_on_submit(
    request,
    api_client,
    application,
    pay_subsidy_granted,
    apprenticeship_program,
    expected_result,
):
    add_attachments_to_application(request, application)

    data = ApplicantApplicationSerializer(application).data

    data["pay_subsidy_granted"] = pay_subsidy_granted
    data["pay_subsidy_percent"] = "50" if pay_subsidy_granted else None
    data["additional_pay_subsidy_percent"] = None
    data["apprenticeship_program"] = apprenticeship_program

    response = api_client.put(
        get_detail_url(application),
        data,
    )
    assert (
        response.status_code == 200
    )  # the values are valid while application is a draft
    application.refresh_from_db()
    submit_response = _submit_application(api_client, application)
    assert submit_response.status_code == expected_result


@pytest.mark.parametrize(
    "from_status,to_status,expected_code",
    [
        (ApplicationStatus.DRAFT, ApplicationStatus.RECEIVED, 200),
        (ApplicationStatus.RECEIVED, ApplicationStatus.HANDLING, 400),
        (
            ApplicationStatus.HANDLING,
            ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED,
            400,
        ),
        (
            ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED,
            ApplicationStatus.RECEIVED,
            400,
        ),
        (
            ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED,
            ApplicationStatus.HANDLING,
            200,
        ),
        (ApplicationStatus.HANDLING, ApplicationStatus.ACCEPTED, 400),
        (ApplicationStatus.HANDLING, ApplicationStatus.REJECTED, 400),
        (ApplicationStatus.HANDLING, ApplicationStatus.CANCELLED, 400),
        (ApplicationStatus.HANDLING, ApplicationStatus.DRAFT, 400),
        (ApplicationStatus.ACCEPTED, ApplicationStatus.HANDLING, 400),
        (ApplicationStatus.ACCEPTED, ApplicationStatus.RECEIVED, 400),
        (ApplicationStatus.CANCELLED, ApplicationStatus.ACCEPTED, 400),
        (ApplicationStatus.REJECTED, ApplicationStatus.DRAFT, 400),
    ],
)
def test_application_status_change_as_applicant(
    request, api_client, application, from_status, to_status, expected_code
):
    """
    modify existing application
    """
    application.status = from_status
    application.save()
    data = ApplicantApplicationSerializer(application).data
    data["status"] = to_status
    data["bases"] = []  # as of 2021-10, bases are not used when submitting application

    if (
        from_status,
        to_status,
    ) in ApplicantApplicationStatusValidator.SUBMIT_APPLICATION_STATE_TRANSITIONS:
        add_attachments_to_application(request, application)
    if data["company"]["organization_type"] == OrganizationType.ASSOCIATION:
        data["association_has_business_activities"] = False
        data["association_immediate_manager_check"] = True

    with mock.patch(
        "terms.models.ApplicantTermsApproval.terms_approval_needed", return_value=False
    ):
        # terms approval is tested separately
        response = api_client.put(
            get_detail_url(application),
            data,
        )
    assert response.status_code == expected_code
    if expected_code == 200:
        assert application.log_entries.all().count() == 1
        assert application.log_entries.all().first().from_status == from_status
        assert application.log_entries.all().first().to_status == to_status
        if to_status == ApplicationStatus.RECEIVED:
            assert response.data["submitted_at"] == datetime.now().replace(
                tzinfo=pytz.utc
            )
        else:
            assert response.data["submitted_at"] is None
    else:
        assert application.log_entries.all().count() == 0


@pytest.mark.parametrize(
    "from_status,to_status,expected_code",
    [
        (ApplicationStatus.DRAFT, ApplicationStatus.RECEIVED, 404),
        (
            ApplicationStatus.HANDLING,
            ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED,
            200,
        ),
        (
            ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED,
            ApplicationStatus.HANDLING,
            200,
        ),
        (ApplicationStatus.HANDLING, ApplicationStatus.ACCEPTED, 200),
        (ApplicationStatus.HANDLING, ApplicationStatus.REJECTED, 200),
        (ApplicationStatus.HANDLING, ApplicationStatus.CANCELLED, 200),
        (ApplicationStatus.ACCEPTED, ApplicationStatus.HANDLING, 200),
        (ApplicationStatus.REJECTED, ApplicationStatus.HANDLING, 200),
        (ApplicationStatus.RECEIVED, ApplicationStatus.DRAFT, 400),
        (ApplicationStatus.ACCEPTED, ApplicationStatus.RECEIVED, 400),
        (ApplicationStatus.CANCELLED, ApplicationStatus.ACCEPTED, 400),
        (ApplicationStatus.CANCELLED, ApplicationStatus.HANDLING, 400),
        (ApplicationStatus.REJECTED, ApplicationStatus.DRAFT, 400),
    ],
)
@pytest.mark.parametrize("log_entry_comment", [None, "", "comment"])
@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
def test_application_status_change_as_handler(
    request,
    handler_api_client,
    application,
    from_status,
    to_status,
    expected_code,
    log_entry_comment,
    mailoutbox,
):
    """
    modify existing application
    """
    application.status = from_status
    application.applicant_language = "en"
    application.save()
    if from_status not in (
        ApplicantApplicationStatusValidator.SUBMIT_APPLICATION_STATE_TRANSITIONS
    ):
        Calculation.objects.create_for_application(application)
        fill_empty_calculation_fields(application)
    application.refresh_from_db()
    data = HandlerApplicationSerializer(application).data
    data["status"] = to_status
    if log_entry_comment is not None:
        # the field is write-only
        data["log_entry_comment"] = log_entry_comment
    data["bases"] = []  # as of 2021-10, bases are not used when submitting application
    if to_status in [ApplicationStatus.RECEIVED, ApplicationStatus.HANDLING]:
        add_attachments_to_application(request, application)
    if data["company"]["organization_type"] == OrganizationType.ASSOCIATION:
        data["association_has_business_activities"] = False
        data["association_immediate_manager_check"] = True

    with mock.patch(
        "terms.models.ApplicantTermsApproval.terms_approval_needed", return_value=False
    ):
        # terms approval is tested separately
        response = handler_api_client.put(
            get_handler_detail_url(application),
            data,
        )
    assert response.status_code == expected_code

    expected_log_entry_comment = ""
    if isinstance(log_entry_comment, str):
        expected_log_entry_comment = log_entry_comment

    if expected_code == 200:
        assert application.log_entries.all().count() == 1
        assert application.log_entries.all().first().from_status == from_status
        assert application.log_entries.all().first().to_status == to_status
        assert (
            application.log_entries.all().first().comment == expected_log_entry_comment
        )

        if to_status == ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED:
            assert application.messages.count() == 1
            assert (
                "Please make the corrections by 18.06.2021"
                in application.messages.first().content
            )
            assert len(mailoutbox) == 1
            assert "You have received a new message" in mailoutbox[0].subject

        if to_status in [
            ApplicationStatus.CANCELLED,
            ApplicationStatus.REJECTED,
            ApplicationStatus.ACCEPTED,
        ]:
            assert (
                response.data["latest_decision_comment"] == expected_log_entry_comment
            )
            assert response.data["handled_at"] == datetime.now().replace(
                tzinfo=pytz.utc
            )
        else:
            assert response.data["latest_decision_comment"] is None
            assert response.data["handled_at"] is None
    else:
        assert application.log_entries.all().count() == 0


def test_application_accept(
    request,
    handler_api_client,
    handling_application,
):
    """
    granted_as_de_minimis_aid is set at the same time the application is accepted.
    """
    handling_application.calculation.granted_as_de_minimis_aid = False
    handling_application.calculation.save()
    handling_application.application_step = ApplicationStep.STEP_6
    handling_application.save()
    data = HandlerApplicationSerializer(handling_application).data
    data["status"] = ApplicationStatus.ACCEPTED
    data["calculation"]["granted_as_de_minimis_aid"] = True
    data["application_step"] = ApplicationStep.STEP_2
    data["log_entry_comment"] = "log entry comment"

    response = handler_api_client.put(
        get_handler_detail_url(handling_application),
        data,
    )
    assert response.status_code == 200

    handling_application.refresh_from_db()
    assert (
        handling_application.log_entries.get(
            to_status=ApplicationStatus.ACCEPTED
        ).comment
        == "log entry comment"
    )
    assert handling_application.application_step == ApplicationStep.STEP_2
    assert handling_application.calculation.granted_as_de_minimis_aid is True


def test_application_with_batch_back_to_handling(
    request,
    handler_api_client,
    decided_application,
):
    """
    When application is moved back to handling, the application
    needs to be remvoved from any batch.
    """
    decided_application.batch = ApplicationBatchFactory()
    decided_application.save()
    data = HandlerApplicationSerializer(decided_application).data
    data["status"] = ApplicationStatus.HANDLING

    response = handler_api_client.put(
        get_handler_detail_url(decided_application),
        data,
    )
    assert response.status_code == 200
    decided_application.refresh_from_db()
    assert decided_application.batch is None


@pytest.mark.parametrize(
    "from_status, to_status, auto_assign",
    [
        (
            ApplicationStatus.HANDLING,
            ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED,
            False,
        ),
        (
            ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED,
            ApplicationStatus.HANDLING,
            True,
        ),
        (ApplicationStatus.HANDLING, ApplicationStatus.ACCEPTED, True),
        (ApplicationStatus.HANDLING, ApplicationStatus.REJECTED, True),
        (ApplicationStatus.HANDLING, ApplicationStatus.CANCELLED, True),
    ],
)
def test_application_status_change_as_handler_auto_assign_handler(
    request, handler_api_client, application, from_status, to_status, auto_assign
):
    """
    modify existing application
    """
    user = get_client_user(handler_api_client)
    user.first_name = "adminFirst"
    user.last_name = "adminLast"
    user.save()
    application.status = from_status
    application.save()
    if from_status not in (
        ApplicantApplicationStatusValidator.SUBMIT_APPLICATION_STATE_TRANSITIONS
    ):
        Calculation.objects.create_for_application(application)
        fill_empty_calculation_fields(application)
    data = HandlerApplicationSerializer(application).data
    data["status"] = to_status
    data["bases"] = []  # as of 2021-10, bases are not used when submitting application
    if to_status in [ApplicationStatus.RECEIVED, ApplicationStatus.HANDLING]:
        add_attachments_to_application(request, application)
    if data["company"]["organization_type"] == OrganizationType.ASSOCIATION:
        data["association_has_business_activities"] = False
        data["association_immediate_manager_check"] = True

    with mock.patch(
        "terms.models.ApplicantTermsApproval.terms_approval_needed", return_value=False
    ):
        # terms approval is tested separately
        response = handler_api_client.put(
            get_handler_detail_url(application),
            data,
        )
    assert response.status_code == 200
    if auto_assign:
        assert response.data["calculation"]["handler_details"]["id"] == str(
            get_client_user(handler_api_client).pk
        )
        assert (
            response.data["calculation"]["handler_details"]["first_name"]
            == get_client_user(handler_api_client).first_name
        )
        assert (
            response.data["calculation"]["handler_details"]["last_name"]
            == get_client_user(handler_api_client).last_name
        )
    else:
        assert response.data["calculation"]["handler_details"] is None


def add_attachments_to_application(request, application):
    # Add enough attachments so that the state transition is valid. See separete test
    # for attachment validation.
    _add_pdf_attachment(request, application, AttachmentType.PAY_SUBSIDY_DECISION)
    _add_pdf_attachment(request, application, AttachmentType.EMPLOYMENT_CONTRACT)
    _add_pdf_attachment(request, application, AttachmentType.EDUCATION_CONTRACT)
    _add_pdf_attachment(request, application, AttachmentType.COMMISSION_CONTRACT)
    _add_pdf_attachment(request, application, AttachmentType.HELSINKI_BENEFIT_VOUCHER)
    _add_pdf_attachment(request, application, AttachmentType.EMPLOYEE_CONSENT)


def test_application_last_modified_at_draft(api_client, application):
    """
    DRAFT application's last_modified_at is visible to applicant
    """
    application.status = ApplicationStatus.DRAFT
    application.save()
    data = ApplicantApplicationSerializer(application).data
    assert data["last_modified_at"] == datetime(2021, 6, 4, tzinfo=pytz.UTC)


@pytest.mark.parametrize(
    "status",
    [
        ApplicationStatus.RECEIVED,
        ApplicationStatus.HANDLING,
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED,
        ApplicationStatus.REJECTED,
    ],
)
def test_application_last_modified_at_non_draft(api_client, application, status):
    """
    non-DRAFT application's last_modified_at is not visible to applicant
    """
    application.status = status
    application.save()
    data = ApplicantApplicationSerializer(application).data
    assert data["last_modified_at"] is None


@pytest.mark.parametrize(
    "pay_subsidy_granted,pay_subsidy_percent,additional_pay_subsidy_percent,expected_code",
    [
        (None, None, None, 200),  # empty application
        (True, 50, None, 200),  # one pay subsidy
        (True, 100, 30, 200),  # two pay subsidies
        (None, 100, None, 400),  # invalid
        (True, None, 50, 400),  # invalid percent
        (True, 99, None, 400),  # invalid choice
        (True, 50, 1, 400),  # invalid percent
    ],
)
def test_application_pay_subsidy(
    api_client,
    application,
    pay_subsidy_granted,
    pay_subsidy_percent,
    additional_pay_subsidy_percent,
    expected_code,
):
    data = ApplicantApplicationSerializer(application).data
    data["pay_subsidy_granted"] = pay_subsidy_granted
    data["pay_subsidy_percent"] = pay_subsidy_percent
    data["additional_pay_subsidy_percent"] = additional_pay_subsidy_percent

    response = api_client.put(
        get_detail_url(application),
        data,
    )
    assert response.status_code == expected_code
    if response.status_code == 200:
        if pay_subsidy_granted:
            assert (
                BenefitType.SALARY_BENEFIT in response.data["available_benefit_types"]
            )
        else:
            assert (
                BenefitType.SALARY_BENEFIT
                not in response.data["available_benefit_types"]
            )


def test_attachment_upload_too_big(api_client, application):
    application.status = ApplicationStatus.DRAFT
    application.save()
    image = Image.new("RGB", (100, 100))
    tmp_file = tempfile.NamedTemporaryFile(suffix=".jpg")
    tmp_file.seek(MAX_UPLOAD_SIZE + 1)
    image.save(tmp_file)
    tmp_file.seek(0)
    response = api_client.post(
        reverse(
            "v1:applicant-application-post-attachment", kwargs={"pk": application.pk}
        ),
        {
            "attachment_file": tmp_file,
            "attachment_type": AttachmentType.EMPLOYMENT_CONTRACT,
        },
        format="multipart",
    )

    assert response.status_code == 400
    assert str(MAX_UPLOAD_SIZE) in json.dumps(
        response.json()
    )  # To avoid false positive
    assert len(application.attachments.all()) == 0


def test_attachment_upload_and_delete(api_client, application):
    image = Image.new("RGB", (100, 100))
    tmp_file = tempfile.NamedTemporaryFile(suffix=".jpg")
    image.save(tmp_file)
    tmp_file.seek(0)

    response = api_client.post(
        reverse(
            "v1:applicant-application-post-attachment", kwargs={"pk": application.pk}
        ),
        {
            "attachment_file": tmp_file,
            "attachment_type": AttachmentType.EMPLOYMENT_CONTRACT,
        },
        format="multipart",
    )

    assert response.status_code == 201
    assert len(application.attachments.all()) == 1
    assert response.data["attachment_file_name"] == os.path.basename(tmp_file.name)
    attachment = application.attachments.all().first()
    assert attachment.attachment_type == AttachmentType.EMPLOYMENT_CONTRACT
    assert os.path.basename(tmp_file.name) == attachment.attachment_file

    response = api_client.delete(
        reverse(
            "v1:applicant-application-delete-attachment",
            kwargs={"pk": application.pk, "attachment_pk": attachment.pk},
        ),
        format="multipart",
    )

    assert response.status_code == 204
    assert len(application.attachments.all()) == 0


VALID_PDF_FILE = "valid_pdf_file.pdf"


def _pdf_file_path(request):
    # path that is accessible from other application's tests too
    return os.path.join(
        request.fspath.dirname, "../../applications/tests/", VALID_PDF_FILE
    )


def _upload_pdf(
    request,
    api_client,
    application,
    attachment_type=AttachmentType.EMPLOYMENT_CONTRACT,
    urlpattern_name="v1:applicant-application-post-attachment",
):
    with open(os.path.join(_pdf_file_path(request)), "rb") as valid_pdf_file:
        return api_client.post(
            reverse(
                urlpattern_name,
                kwargs={"pk": application.pk},
            ),
            {
                "attachment_file": valid_pdf_file,
                "attachment_type": attachment_type,
            },
            format="multipart",
        )


def _add_pdf_attachment(
    request, application, attachment_type=AttachmentType.EMPLOYMENT_CONTRACT
):
    # add attachment, bypassing validation, so attachment can be added even if application
    # state does not allow it
    with open(_pdf_file_path(request), "rb") as valid_pdf_file:
        file_upload = SimpleUploadedFile(VALID_PDF_FILE, valid_pdf_file.read())
        attachment = Attachment.objects.create(
            application=application,
            attachment_file=file_upload,
            content_type="application/pdf",
            attachment_type=attachment_type,
        )
        return attachment


@pytest.mark.django_db
def test_attachment_delete_unauthenticated(request, anonymous_client, application):
    attachment = _add_pdf_attachment(request, application)
    response = anonymous_client.delete(
        reverse(
            "v1:applicant-application-delete-attachment",
            kwargs={"pk": application.pk, "attachment_pk": attachment.pk},
        ),
        format="multipart",
    )
    assert response.status_code == 403


@pytest.mark.django_db
def test_attachment_delete_unauthorized(
    request,
    api_client,
    anonymous_application,
    mock_get_organisation_roles_and_create_company,
):
    attachment = _add_pdf_attachment(request, anonymous_application)
    response = api_client.delete(
        reverse(
            "v1:applicant-application-delete-attachment",
            kwargs={"pk": anonymous_application.pk, "attachment_pk": attachment.pk},
        ),
        format="multipart",
    )
    assert response.status_code == 404


@pytest.mark.parametrize(
    "status,expected_code",
    [
        (ApplicationStatus.DRAFT, 204),
        (ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED, 204),
        (ApplicationStatus.HANDLING, 403),
        (ApplicationStatus.RECEIVED, 403),
        (ApplicationStatus.ACCEPTED, 403),
        (ApplicationStatus.CANCELLED, 403),
        (ApplicationStatus.REJECTED, 403),
    ],
)
def test_attachment_delete(request, api_client, application, status, expected_code):
    application.status = status
    application.save()
    attachment = _add_pdf_attachment(request, application)
    response = api_client.delete(
        reverse(
            "v1:applicant-application-delete-attachment",
            kwargs={"pk": application.pk, "attachment_pk": attachment.pk},
        ),
        format="multipart",
    )

    assert response.status_code == expected_code
    if expected_code == 204:
        assert application.attachments.count() == 0
    else:
        assert application.attachments.count() == 1


@pytest.mark.parametrize(
    "status,upload_result",
    [
        (ApplicationStatus.DRAFT, 201),
        (ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED, 201),
        (ApplicationStatus.HANDLING, 403),
        (ApplicationStatus.ACCEPTED, 403),
        (ApplicationStatus.REJECTED, 403),
    ],
)
def test_pdf_attachment_upload_and_download_as_applicant(
    request, api_client, application, status, upload_result
):
    application.status = status
    application.save()
    response = _upload_pdf(request, api_client, application)
    assert response.status_code == upload_result
    if upload_result != 201:
        return
    assert len(application.attachments.all()) == 1
    attachment = application.attachments.all().first()
    assert attachment.attachment_type == AttachmentType.EMPLOYMENT_CONTRACT
    assert attachment.attachment_file.name.endswith(".pdf")
    response = api_client.get(get_detail_url(application))
    assert len(response.data["attachments"]) == 1
    assert response.data["attachments"][0]["attachment_file"].startswith("http://")
    assert (
        "handlerapplications" not in response.data["attachments"][0]["attachment_file"]
    )
    file_dl = api_client.get(response.data["attachments"][0]["attachment_file"])
    assert file_dl.status_code == 200
    bytes = file_dl.getvalue()
    assert bytes[:4].decode("utf-8") == "%PDF"


@pytest.mark.parametrize(
    "status,upload_result",
    [
        (ApplicationStatus.DRAFT, 404),
        (ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED, 201),
        (ApplicationStatus.HANDLING, 201),
        (ApplicationStatus.ACCEPTED, 403),
        (ApplicationStatus.REJECTED, 403),
    ],
)
def test_pdf_attachment_upload_and_download_as_handler(
    request, handler_api_client, application, status, upload_result
):
    application.status = status
    application.save()
    response = _upload_pdf(
        request,
        handler_api_client,
        application,
        urlpattern_name="v1:handler-application-post-attachment",
    )
    assert response.status_code == upload_result
    if upload_result != 201:
        return
    response = handler_api_client.get(get_handler_detail_url(application))
    assert len(response.data["attachments"]) == 1
    assert response.data["attachments"][0]["attachment_file"]
    # the URL must point to the handler API
    assert "handlerapplications" in response.data["attachments"][0]["attachment_file"]
    file_dl = handler_api_client.get(response.data["attachments"][0]["attachment_file"])
    assert file_dl.status_code == 200


@pytest.mark.django_db
def test_attachment_download_unauthenticated(request, anonymous_client, application):
    attachment = _add_pdf_attachment(request, application)
    response = anonymous_client.get(
        reverse(
            "v1:applicant-application-download-attachment",
            kwargs={"pk": application.pk, "attachment_pk": attachment.pk},
        ),
        format="multipart",
    )
    assert response.status_code == 403


@pytest.mark.django_db
def test_attachment_download_unauthorized(
    request,
    api_client,
    anonymous_application,
    mock_get_organisation_roles_and_create_company,
):
    attachment = _add_pdf_attachment(request, anonymous_application)
    response = api_client.get(
        reverse(
            "v1:applicant-application-download-attachment",
            kwargs={"pk": anonymous_application.pk, "attachment_pk": attachment.pk},
        ),
        format="multipart",
    )
    assert response.status_code == 404


@pytest.mark.parametrize(
    "status",
    [
        ApplicationStatus.RECEIVED,
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.CANCELLED,
        ApplicationStatus.REJECTED,
    ],
)
def test_attachment_upload_invalid_status(request, api_client, application, status):
    application.status = status
    application.save()
    response = _upload_pdf(request, api_client, application)
    assert response.status_code == 403
    assert len(application.attachments.all()) == 0


@pytest.mark.parametrize("extension", ["pdf", "png", "jpg"])
def test_invalid_attachment_upload(api_client, application, extension):

    tmp_file = tempfile.NamedTemporaryFile(suffix=f".{extension}")
    tmp_file.write(b"invalid data " * 100)
    tmp_file.seek(0)

    response = api_client.post(
        reverse(
            "v1:applicant-application-post-attachment", kwargs={"pk": application.pk}
        ),
        {
            "attachment_file": tmp_file,
            "attachment_type": AttachmentType.EMPLOYMENT_CONTRACT,
        },
        format="multipart",
    )
    re.match("Not a valid.*file", str(response.data["non_field_errors"][0]))
    assert response.status_code == 400
    assert len(application.attachments.all()) == 0


def test_too_many_attachments(request, api_client, application):

    for _ in range(AttachmentSerializer.MAX_ATTACHMENTS_PER_APPLICATION):
        response = _upload_pdf(request, api_client, application)
        assert response.status_code == 201

    response = _upload_pdf(request, api_client, application)
    assert response.status_code == 400
    assert (
        application.attachments.count()
        == AttachmentSerializer.MAX_ATTACHMENTS_PER_APPLICATION
    )


def test_attachment_requirements(
    api_client, application, mock_get_organisation_roles_and_create_company
):
    application.benefit_type = BenefitType.EMPLOYMENT_BENEFIT
    application.pay_subsidy_granted = True
    application.pay_subsidy_percent = 50
    application.apprenticeship_program = False
    application.company = mock_get_organisation_roles_and_create_company
    application.save()
    response = api_client.get(get_detail_url(application))
    assert json.loads(json.dumps(response.data["attachment_requirements"])) == [
        ["employment_contract", "required"],
        ["helsinki_benefit_voucher", "optional"],
        ["pay_subsidy_decision", "required"],
    ]


def _submit_application(api_client, application):
    data = ApplicantApplicationSerializer(application).data
    data["status"] = ApplicationStatus.RECEIVED
    with mock.patch(
        "terms.models.ApplicantTermsApproval.terms_approval_needed", return_value=False
    ):
        # terms approval is tested separately
        return api_client.put(
            get_detail_url(application),
            data,
        )


def test_attachment_validation(request, api_client, application):
    application.benefit_type = BenefitType.EMPLOYMENT_BENEFIT
    application.pay_subsidy_granted = True
    application.pay_subsidy_percent = 50
    application.apprenticeship_program = False
    application.save()

    _add_pdf_attachment(request, application, AttachmentType.EMPLOYEE_CONSENT)

    # try to submit the application without attachments
    response = _submit_application(api_client, application)
    assert response.status_code == 400

    # add one of two required attachments
    response = _upload_pdf(
        request,
        api_client,
        application,
        attachment_type=AttachmentType.EMPLOYMENT_CONTRACT,
    )
    assert response.status_code == 201
    response = _submit_application(api_client, application)
    assert str(response.data[0]) == "Application does not have required attachments"

    application.refresh_from_db()
    assert application.status == ApplicationStatus.DRAFT

    # add last required attachment
    response = _upload_pdf(
        request,
        api_client,
        application,
        attachment_type=AttachmentType.PAY_SUBSIDY_DECISION,
    )
    assert response.status_code == 201
    response = _submit_application(api_client, application)
    assert response.status_code == 200
    application.refresh_from_db()
    assert application.status == ApplicationStatus.RECEIVED


def test_purge_extra_attachments(request, api_client, application):
    application.benefit_type = BenefitType.SALARY_BENEFIT
    application.pay_subsidy_granted = True
    application.pay_subsidy_percent = 50
    application.apprenticeship_program = False
    application.save()

    lots_of_attachments = [
        AttachmentType.EMPLOYMENT_CONTRACT,
        AttachmentType.PAY_SUBSIDY_DECISION,
        AttachmentType.COMMISSION_CONTRACT,  # extra
        AttachmentType.EMPLOYMENT_CONTRACT,
        AttachmentType.PAY_SUBSIDY_DECISION,
        AttachmentType.COMMISSION_CONTRACT,  # extra
        AttachmentType.HELSINKI_BENEFIT_VOUCHER,
        AttachmentType.EDUCATION_CONTRACT,  # extra
        AttachmentType.EDUCATION_CONTRACT,  # extra
        AttachmentType.EMPLOYEE_CONSENT,
    ]
    for attachment_type in lots_of_attachments:
        response = _upload_pdf(request, api_client, application, attachment_type)
        assert response.status_code == 201

    assert application.attachments.count() == len(lots_of_attachments)

    response = _submit_application(api_client, application)
    assert response.status_code == 200
    assert application.attachments.count() == 6


def test_employee_consent_upload(request, api_client, application):
    application.benefit_type = BenefitType.EMPLOYMENT_BENEFIT
    application.pay_subsidy_granted = True
    application.pay_subsidy_percent = 50
    application.apprenticeship_program = False
    application.save()
    # add the required attachments except consent
    response = _upload_pdf(
        request,
        api_client,
        application,
        attachment_type=AttachmentType.EMPLOYMENT_CONTRACT,
    )
    assert response.status_code == 201
    response = _upload_pdf(
        request,
        api_client,
        application,
        attachment_type=AttachmentType.PAY_SUBSIDY_DECISION,
    )
    assert response.status_code == 201

    # try to submit the application without consent
    response = _submit_application(api_client, application)
    assert response.status_code == 400
    assert (
        str(response.data[0])
        == "Application does not have the employee consent attachment"
    )

    # upload the consent
    _upload_pdf(
        request,
        api_client,
        application,
        attachment_type=AttachmentType.EMPLOYEE_CONSENT,
    )
    _upload_pdf(
        request,
        api_client,
        application,
        attachment_type=AttachmentType.EMPLOYEE_CONSENT,
    )
    assert (
        application.attachments.filter(
            attachment_type=AttachmentType.EMPLOYEE_CONSENT
        ).count()
        == 2
    )
    # Cannot upload multiple employee consent
    response = _submit_application(api_client, application)
    assert response.status_code == 400
    assert (
        str(response.data[0])
        == "Application cannot have more than one employee consent attachment"
    )
    application.attachments.filter(attachment_type=AttachmentType.EMPLOYEE_CONSENT)[
        0
    ].delete()
    assert (
        application.attachments.filter(
            attachment_type=AttachmentType.EMPLOYEE_CONSENT
        ).count()
        == 1
    )
    response = _submit_application(api_client, application)
    assert response.status_code == 200
    application.refresh_from_db()
    assert application.status == ApplicationStatus.RECEIVED


def test_application_number(api_client, application):
    assert Application.objects.count() == 1

    # Random initial value for application number, decided in
    # applications/migrations/0012_create_application_number_seq.py
    assert application.application_number > 125000

    new_application = ApplicationFactory()
    assert Application.objects.count() == 2
    assert new_application.application_number == application.application_number + 1

    new_application.delete()
    assert Application.objects.count() == 1

    # Next application should not have old application_number if the previous one was deleted
    next_application = ApplicationFactory()
    assert Application.objects.count() == 2
    assert next_application.application_number == application.application_number + 2


def test_application_api_before_accept_tos(api_client, application):
    # Clear user TOS approval
    TermsOfServiceApproval.objects.all().delete()

    # Application list
    response = api_client.get(reverse("v1:applicant-application-list"))
    assert response.status_code == 403
    assert (
        str(response.data["detail"])
        == "You have to accept Terms of Service before doing any action"
    )

    # Application get
    response = api_client.get(get_detail_url(application))
    assert response.status_code == 403
    assert (
        str(response.data["detail"])
        == "You have to accept Terms of Service before doing any action"
    )

    # Application post
    data = ApplicantApplicationSerializer(application).data
    del data["id"]  # id is read-only field and would be ignored
    response = api_client.post(
        reverse("v1:applicant-application-list"),
        data,
    )
    assert response.status_code == 403
    assert (
        str(response.data["detail"])
        == "You have to accept Terms of Service before doing any action"
    )

    # Application put
    data = ApplicantApplicationSerializer(application).data
    data["company_contact_person_phone_number"] = "+358505658789"
    response = api_client.put(
        get_detail_url(application),
        data,
    )
    assert response.status_code == 403
    assert (
        str(response.data["detail"])
        == "You have to accept Terms of Service before doing any action"
    )

    # Application delete
    response = api_client.delete(get_detail_url(application))
    assert response.status_code == 403
    assert (
        str(response.data["detail"])
        == "You have to accept Terms of Service before doing any action"
    )


def test_application_additional_information_needed_by(api_client, handling_application):
    response = api_client.get(get_detail_url(handling_application))
    assert response.status_code == 200
    assert response.data["additional_information_needed_by"] is None

    handling_application.status = ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED
    handling_application.save()
    with freeze_time("2021-12-01"):
        ApplicationLogEntry.objects.create(
            application=handling_application,
            from_status=ApplicationStatus.RECEIVED,
            to_status=ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED,
        )
    response = api_client.get(get_detail_url(handling_application))
    assert response.status_code == 200
    assert response.data["additional_information_needed_by"] == date(2021, 12, 15)


def test_application_status_last_changed_at(api_client, handling_application):
    with freeze_time("2021-12-01"):
        ApplicationLogEntry.objects.create(
            application=handling_application,
            from_status=ApplicationStatus.RECEIVED,
            to_status=ApplicationStatus.HANDLING,
        )
    response = api_client.get(get_detail_url(handling_application))
    assert response.status_code == 200
    assert response.data["status_last_changed_at"] == datetime(
        2021, 12, 1, tzinfo=pytz.UTC
    )


def test_handler_application_default_ordering(handler_api_client):
    f = faker.Faker()
    combos = [
        (ReceivedApplicationFactory, ApplicationStatus.RECEIVED),
        (HandlingApplicationFactory, ApplicationStatus.HANDLING),
        (DecidedApplicationFactory, ApplicationStatus.ACCEPTED),
    ]
    for _ in range(5):
        for class_name, status in combos:
            application = class_name()
            random_datetime = f.past_datetime()
            application.log_entries.filter(to_status=status).update(
                created_at=random_datetime
            )
            Calculation.objects.filter(application__id=application.pk).update(
                modified_at=random_datetime
            )

    def _expected_sort_key(obj):
        handled_at_key = None
        if (
            log_entry := obj.log_entries.filter(
                to_status__in=[
                    ApplicationStatus.REJECTED,
                    ApplicationStatus.ACCEPTED,
                    ApplicationStatus.CANCELLED,
                ]
            )
            .order_by("-created_at")
            .first()
        ):
            handled_at_key = log_entry.created_at.timestamp()

        return (
            -handled_at_key if handled_at_key else float("-inf"),
            -obj.calculation.modified_at.timestamp(),
        )

    # in-memory sort using _expected_sort_key and the database sort must be the same
    expected_sorting = sorted(Application.objects.all(), key=_expected_sort_key)
    expected_application_ids = [str(elem.pk) for elem in expected_sorting]

    response = handler_api_client.get(
        reverse("v1:handler-application-simplified-application-list")
    )
    returned_application_ids = [elem["id"] for elem in response.data]
    assert expected_application_ids == returned_application_ids
