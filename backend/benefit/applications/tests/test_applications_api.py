import copy
import json
import os
import re
import tempfile
from datetime import date, datetime

import pytest
import pytz
from applications.api.v1.serializers import ApplicationSerializer, AttachmentSerializer
from applications.enums import (
    ApplicationStatus,
    AttachmentType,
    BenefitType,
    OrganizationType,
)
from applications.models import Application, ApplicationLogEntry, Attachment, Employee
from applications.tests.factories import ApplicationFactory, DecidedApplicationFactory
from companies.tests.factories import CompanyFactory
from django.core.files.uploadedfile import SimpleUploadedFile
from helsinkibenefit.settings import MAX_UPLOAD_SIZE
from PIL import Image
from rest_framework.reverse import reverse


def get_detail_url(application):
    return reverse("v1:application-detail", kwargs={"pk": application.id})


def test_applications_unauthenticated(anonymous_client, application):
    response = anonymous_client.get(reverse("v1:application-list"))
    assert response.status_code == 403


def test_applications_unauthorized(
    api_client, anonymous_application, mock_get_organisation_roles_and_create_company
):
    response = api_client.get(reverse("v1:application-list"))
    assert len(response.data) == 0
    assert response.status_code == 200


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


def test_applications_filter_by_batch(api_client, application_batch, application):
    application_batch.applications.all().update(company=application.company)
    url = reverse("v1:application-list") + f"?batch={application_batch.pk}"
    response = api_client.get(url)
    assert len(response.data) == 2
    assert response.status_code == 200


def test_applications_filter_by_ssn(api_client, application, association_application):
    assert (
        application.employee.social_security_number
        != association_application.employee.social_security_number
    )
    url = (
        reverse("v1:application-list")
        + f"?employee__social_security_number={application.employee.social_security_number}"
    )
    response = api_client.get(url)
    assert len(response.data) == 1
    assert response.data[0]["id"] == str(application.id)
    assert response.status_code == 200


def test_application_single_read_unauthenticated(anonymous_client, application):
    response = anonymous_client.get(get_detail_url(application))
    assert response.status_code == 403


def test_application_single_read_unauthorized(
    api_client, anonymous_application, mock_get_organisation_roles_and_create_company
):
    response = api_client.get(get_detail_url(anonymous_application))
    assert response.status_code == 404


def test_application_single_read(api_client, application):
    response = api_client.get(get_detail_url(application))
    assert response.data["batch"] is None
    assert response.data["ahjo_decision"] is None
    assert response.status_code == 200


def test_application_template(api_client):
    response = api_client.get(reverse("v1:application-get-application-template"))
    assert (
        len(response.data["de_minimis_aid_set"]) == 0
    )  # as of 2021-06-16, just a dummy implementation exists


def test_application_post_success_unauthenticated(anonymous_client, application):
    data = ApplicationSerializer(application).data
    application.delete()
    assert len(Application.objects.all()) == 0

    del data["id"]  # id is read-only field and would be ignored
    response = anonymous_client.post(
        reverse("v1:application-list"),
        data,
    )
    assert response.status_code == 403


def test_application_post_success(api_client, application):
    """
    Create a new application
    """
    data = ApplicationSerializer(application).data
    application.delete()
    assert len(Application.objects.all()) == 0

    del data["id"]  # id is read-only field and would be ignored
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
        new_application.official_company_street_address
        == new_application.company.street_address
    )
    assert new_application.official_company_postcode == new_application.company.postcode
    assert new_application.official_company_city == new_application.company.city


def test_application_post_unfinished(api_client, application):
    """
    Create a new application with partial information
    like when hitting "save as draft" without entering any fields
    """

    data = ApplicationSerializer(application).data
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
        reverse("v1:application-list"),
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


def test_application_post_invalid_data(api_client, application):
    data = ApplicationSerializer(application).data
    application.delete()
    assert len(Application.objects.all()) == 0

    del data["id"]
    data["de_minimis_aid_set"][0]["amount"] = "300000.00"  # value too high
    data["status"] = "foo"  # invalid value
    data["bases"] = ["something_completely_different"]  # invalid value
    data["applicant_language"] = None  # non-null required
    data[
        "company_contact_person_phone_number"
    ] = "+359505658789"  # Invalid country code
    response = api_client.post(reverse("v1:application-list"), data, format="json")
    assert response.status_code == 400
    assert response.data.keys() == {
        "status",
        "bases",
        "applicant_language",
        "company_contact_person_phone_number",
        "de_minimis_aid_set",
    }
    assert response.data["de_minimis_aid_set"][0].keys() == {"amount"}
    assert len(response.data["de_minimis_aid_set"]) == 2


def test_application_post_invalid_employee_data(api_client, application):
    data = ApplicationSerializer(application).data
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
    response = api_client.post(reverse("v1:application-list"), data, format="json")
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
    response = api_client.post(reverse("v1:application-list"), data, format="json")
    assert response.status_code == 400
    assert response.data.keys() == {"employee"}
    assert (
        "monthly_pay" in response.data["employee"].keys()
    )  # Check if the error still there


def test_application_put_edit_fields_unauthenticated(anonymous_client, application):
    data = ApplicationSerializer(application).data
    data["company_contact_person_phone_number"] = "+358505658789"
    response = anonymous_client.put(
        get_detail_url(application),
        data,
    )
    assert response.status_code == 403


def test_application_put_edit_fields_unauthorized(
    api_client, anonymous_application, mock_get_organisation_roles_and_create_company
):
    data = ApplicationSerializer(anonymous_application).data
    data["company_contact_person_phone_number"] = "+358505658789"
    response = api_client.put(
        get_detail_url(anonymous_application),
        data,
    )
    assert response.status_code == 404


def test_application_put_edit_fields(api_client, application):
    """
    modify existing application
    """
    data = ApplicationSerializer(application).data
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


def test_application_put_edit_employee(api_client, application):
    """
    modify existing application
    """
    data = ApplicationSerializer(application).data
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


def test_application_put_invalid_data(api_client, application):
    data = ApplicationSerializer(application).data
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
    data = ApplicationSerializer(application).data

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


def test_application_edit_de_minimis_aid_too_high(api_client, application):
    data = ApplicationSerializer(application).data

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
    data_after = ApplicationSerializer(application).data
    assert previous_aid == data_after["de_minimis_aid_set"]


def test_application_edit_benefit_type_business(api_client, application):
    data = ApplicationSerializer(application).data
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
    data = ApplicationSerializer(application).data
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
    data = ApplicationSerializer(association_application).data
    company = mock_get_organisation_roles_and_create_company
    company.company_form = "ry"
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
    data = ApplicationSerializer(association_application).data
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
    data = ApplicationSerializer(association_application).data
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
    data = ApplicationSerializer(association_application).data
    data["benefit_type"] = BenefitType.EMPLOYMENT_BENEFIT

    response = api_client.put(
        get_detail_url(association_application),
        data,
    )
    assert response.status_code == 400


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
    ],
)
def test_application_date_range(
    api_client, application, benefit_type, start_date, end_date, status_code
):
    """
    modify existing application
    """
    data = ApplicationSerializer(application).data

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
    "previous_benefits, benefit_type, expected_result",
    [
        (
            [
                (
                    "2020-01-01",
                    "2020-12-31",
                )
            ],
            BenefitType.SALARY_BENEFIT,
            400,
        ),  # 12 months of benefit used, 24 months not elapsed
        (
            [
                (
                    "2020-01-01",
                    "2020-12-31",
                )
            ],
            BenefitType.EMPLOYMENT_BENEFIT,
            400,
        ),  # same as above, benefit_type does not matter
        (
            [
                (
                    "2019-01-01",
                    "2019-12-31",
                )
            ],
            BenefitType.EMPLOYMENT_BENEFIT,
            400,
        ),  # 12 months of benefit used, 24 months not elapsed
        (
            [
                (
                    "2018-01-01",
                    "2018-12-31",
                )
            ],
            BenefitType.EMPLOYMENT_BENEFIT,
            200,
        ),  # 24 months is elapsed
        (
            [
                (
                    "2020-01-01",
                    "2020-06-30",
                )
            ],
            BenefitType.SALARY_BENEFIT,
            200,
        ),  # only 6 months of benefit used
        (
            [
                (
                    "2020-01-01",
                    "2020-07-01",
                ),
            ],
            BenefitType.SALARY_BENEFIT,
            400,
        ),
        # 6 months + 1 day of benefit used, one day too much for a new 6-month benefit
        (
            [
                (
                    "2019-07-01",
                    "2019-12-31",
                ),
                (
                    "2020-07-01",
                    "2020-12-31",
                ),
            ],
            BenefitType.SALARY_BENEFIT,
            400,
        ),  # 24 months not elapsed
        (
            [
                (
                    "2019-01-01",
                    "2019-06-30",
                ),
                (
                    "2020-07-01",
                    "2020-12-31",
                ),
            ],
            BenefitType.SALARY_BENEFIT,
            400,
        ),  # 24 months not elapsed
        (
            [
                (
                    "2018-01-01",
                    "2018-06-30",
                ),
                (
                    "2018-07-01",
                    "2018-12-31",
                ),
            ],
            BenefitType.SALARY_BENEFIT,
            200,
        ),  # 24 months elapsed
        (
            [
                (
                    "2017-07-01",
                    "2018-06-30",
                ),
                (
                    "2020-07-01",
                    "2020-12-31",
                ),
            ],
            BenefitType.SALARY_BENEFIT,
            200,
        ),
        # 24-month gap in past benefits so the benefit from 2017-2018 is not included and application is valid
        (
            [
                (
                    "2018-01-01",
                    "2018-03-31",
                ),
                (
                    "2019-01-01",
                    "2019-03-31",
                ),
                (
                    "2020-01-01",
                    "2020-03-31",
                ),
            ],
            BenefitType.SALARY_BENEFIT,
            400,
        ),
        # several previously granted benefits that don't have a 24-month gap
    ],
)
def test_application_with_previously_granted_benefits(
    api_client, application, previous_benefits, benefit_type, expected_result
):
    for previous_start_date, previous_end_date in previous_benefits:
        # previous, already granted benefits for the same employee+company
        decided_application = DecidedApplicationFactory()
        decided_application.benefit_type = BenefitType.SALARY_BENEFIT
        decided_application.start_date = previous_start_date
        decided_application.end_date = previous_end_date
        decided_application.company = application.company
        decided_application.save()
        decided_application.employee.social_security_number = (
            application.employee.social_security_number
        )
        decided_application.employee.save()

    data = ApplicationSerializer(application).data

    data["benefit_type"] = benefit_type
    data["start_date"] = date(2021, 7, 1)
    data["end_date"] = date(2021, 12, 31)
    data["pay_subsidy_granted"] = True
    data["pay_subsidy_percent"] = 50

    response = api_client.put(
        get_detail_url(application),
        data,
    )
    assert response.status_code == expected_result
    if expected_result == 200:
        assert response.data["start_date"] == "2021-07-01"
        assert response.data["end_date"] == "2021-12-31"
    else:
        assert response.data.keys() == {"start_date"}


@pytest.mark.parametrize(
    "from_status,to_status,expected_code",
    [
        (ApplicationStatus.DRAFT, ApplicationStatus.RECEIVED, 200),
        (
            ApplicationStatus.RECEIVED,
            ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED,
            200,
        ),
        (ApplicationStatus.RECEIVED, ApplicationStatus.ACCEPTED, 200),
        (ApplicationStatus.RECEIVED, ApplicationStatus.REJECTED, 200),
        (ApplicationStatus.RECEIVED, ApplicationStatus.CANCELLED, 200),
        (ApplicationStatus.RECEIVED, ApplicationStatus.DRAFT, 400),
        (ApplicationStatus.ACCEPTED, ApplicationStatus.RECEIVED, 400),
        (ApplicationStatus.CANCELLED, ApplicationStatus.ACCEPTED, 400),
        (ApplicationStatus.REJECTED, ApplicationStatus.DRAFT, 400),
    ],
)
def test_application_status_change(
    request, api_client, application, from_status, to_status, expected_code
):
    """
    modify existing application
    """
    application.status = from_status
    application.save()
    data = ApplicationSerializer(application).data
    data["status"] = to_status

    if to_status == ApplicationStatus.RECEIVED:
        # Add enough attachments so that the state transition is valid. See separete test
        # for attachment validation.
        _add_pdf_attachment(request, application, AttachmentType.PAY_SUBSIDY_DECISION)
        _add_pdf_attachment(request, application, AttachmentType.EMPLOYMENT_CONTRACT)
        _add_pdf_attachment(request, application, AttachmentType.EDUCATION_CONTRACT)
        _add_pdf_attachment(request, application, AttachmentType.COMMISSION_CONTRACT)
        _add_pdf_attachment(
            request, application, AttachmentType.HELSINKI_BENEFIT_VOUCHER
        )
        _add_pdf_attachment(request, application, AttachmentType.EMPLOYEE_CONSENT)
    if data["organization_type"] == OrganizationType.ASSOCIATION:
        data["association_has_business_activities"] = False

    response = api_client.put(
        get_detail_url(application),
        data,
    )
    assert response.status_code == expected_code
    if expected_code == 200:
        assert application.log_entries.all().count() == 1
        assert application.log_entries.all().first().from_status == from_status
        assert application.log_entries.all().first().to_status == to_status
    else:
        assert application.log_entries.all().count() == 0


def test_application_last_modified_at_draft(api_client, application):
    """
    DRAFT application's last_modified_at is visible to applicant
    """
    application.status = ApplicationStatus.DRAFT
    application.save()
    data = ApplicationSerializer(application).data
    assert data["last_modified_at"] == datetime(2021, 6, 4, tzinfo=pytz.UTC)


@pytest.mark.parametrize(
    "status",
    [
        ApplicationStatus.RECEIVED,
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
    data = ApplicationSerializer(application).data
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
    data = ApplicationSerializer(application).data
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
        reverse("v1:application-post-attachment", kwargs={"pk": application.pk}),
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
        reverse("v1:application-post-attachment", kwargs={"pk": application.pk}),
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
            "v1:application-delete-attachment",
            kwargs={"pk": application.pk, "attachment_pk": attachment.pk},
        ),
        format="multipart",
    )

    assert response.status_code == 204
    assert len(application.attachments.all()) == 0


VALID_PDF_FILE = "valid_pdf_file.pdf"


def _upload_pdf(
    request, api_client, application, attachment_type=AttachmentType.EMPLOYMENT_CONTRACT
):
    with open(
        os.path.join(request.fspath.dirname, VALID_PDF_FILE), "rb"
    ) as valid_pdf_file:
        return api_client.post(
            reverse("v1:application-post-attachment", kwargs={"pk": application.pk}),
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
    with open(
        os.path.join(request.fspath.dirname, VALID_PDF_FILE), "rb"
    ) as valid_pdf_file:
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
            "v1:application-delete-attachment",
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
            "v1:application-delete-attachment",
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
            "v1:application-delete-attachment",
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
    "status",
    [
        ApplicationStatus.DRAFT,
        ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED,
    ],
)
def test_pdf_attachment_upload(request, api_client, application, status):
    application.status = status
    application.save()
    response = _upload_pdf(request, api_client, application)
    assert response.status_code == 201
    assert len(application.attachments.all()) == 1
    attachment = application.attachments.all().first()
    assert attachment.attachment_type == AttachmentType.EMPLOYMENT_CONTRACT
    assert attachment.attachment_file.name.endswith(".pdf")


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
    assert response.status_code == 400
    assert len(application.attachments.all()) == 0


@pytest.mark.parametrize("extension", ["pdf", "png", "jpg"])
def test_invalid_attachment_upload(api_client, application, extension):

    tmp_file = tempfile.NamedTemporaryFile(suffix=f".{extension}")
    tmp_file.write(b"invalid data " * 100)
    tmp_file.seek(0)

    response = api_client.post(
        reverse("v1:application-post-attachment", kwargs={"pk": application.pk}),
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
    data = ApplicationSerializer(application).data
    data["status"] = ApplicationStatus.RECEIVED
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
        AttachmentType.EMPLOYEE_CONSENT,
    ]
    for attachment_type in lots_of_attachments:
        response = _upload_pdf(request, api_client, application, attachment_type)
        assert response.status_code == 201

    assert application.attachments.count() == len(lots_of_attachments)

    response = _submit_application(api_client, application)
    assert response.status_code == 200
    assert application.attachments.count() == 7


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
    response = _upload_pdf(
        request,
        api_client,
        application,
        attachment_type=AttachmentType.EMPLOYEE_CONSENT,
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
