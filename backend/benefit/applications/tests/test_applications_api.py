import copy
import json
import os
import tempfile
from datetime import date, datetime

import pytest
import pytz
from applications.api.v1.serializers import ApplicationSerializer
from applications.enums import (
    ApplicationStatus,
    AttachmentType,
    BenefitType,
    OrganizationType,
)
from applications.models import Application, ApplicationLogEntry, Employee
from applications.tests.conftest import *  # noqa
from common.tests.conftest import *  # noqa
from companies.tests.factories import CompanyFactory
from helsinkibenefit.tests.conftest import *  # noqa
from PIL import Image
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
    response = api_client.post(reverse("v1:application-list"), data, format="json")
    assert response.status_code == 400
    assert response.data.keys() == {
        "status",
        "bases",
        "applicant_language",
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
    response = api_client.post(reverse("v1:application-list"), data, format="json")
    assert response.status_code == 400
    assert response.data.keys() == {"employee"}
    assert response.data["employee"].keys() == {
        "monthly_pay",
        "social_security_number",
        "employee_language",
    }


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
    assert (
        response.data["company_contact_person_phone_number"] == "+358505658789"
    )  # normalized format
    application.refresh_from_db()
    assert application.company_contact_person_phone_number == "+358505658789"


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
        response.data["employee"]["phone_number"] == "+358505658789"
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

    response = api_client.put(
        get_detail_url(application),
        data,
    )
    assert response.status_code == 200
    assert response.data["available_benefit_types"] == [
        BenefitType.SALARY_BENEFIT,
        BenefitType.COMMISSION_BENEFIT,
        BenefitType.EMPLOYMENT_BENEFIT,
    ]


def test_application_edit_benefit_type_business_association(
    api_client, association_application
):
    data = ApplicationSerializer(association_application).data
    data["benefit_type"] = BenefitType.EMPLOYMENT_BENEFIT
    data["association_has_business_activities"] = True
    data["apprenticeship_program"] = False

    response = api_client.put(
        get_detail_url(association_application),
        data,
    )
    assert response.status_code == 200
    assert response.data["available_benefit_types"] == [
        BenefitType.SALARY_BENEFIT,
        BenefitType.COMMISSION_BENEFIT,
        BenefitType.EMPLOYMENT_BENEFIT,
    ]


def test_application_edit_benefit_type_business_association_with_apprenticeship(
    api_client, association_application
):
    data = ApplicationSerializer(association_application).data
    data["benefit_type"] = BenefitType.EMPLOYMENT_BENEFIT
    data["association_has_business_activities"] = True
    data["apprenticeship_program"] = True

    response = api_client.put(
        get_detail_url(association_application),
        data,
    )
    assert response.status_code == 200
    assert response.data["available_benefit_types"] == [
        BenefitType.SALARY_BENEFIT,
        BenefitType.EMPLOYMENT_BENEFIT,
    ]


def test_application_edit_benefit_type_non_business(
    api_client, association_application
):
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
    data = ApplicationSerializer(association_application).data
    data["benefit_type"] = BenefitType.EMPLOYMENT_BENEFIT

    response = api_client.put(
        get_detail_url(association_application),
        data,
    )
    assert response.status_code == 400


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
    response = api_client.put(
        get_detail_url(application),
        data,
    )
    assert response.status_code == status_code
    if status_code == 200:
        assert response.data["start_date"] == start_date
        assert response.data["end_date"] == end_date


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
    api_client, application, from_status, to_status, expected_code
):
    """
    modify existing application
    """
    application.status = from_status
    application.save()
    data = ApplicationSerializer(application).data

    data["status"] = to_status
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


def test_attachment_requirements(
    api_client,
    application,
):
    application.benefit_type = BenefitType.EMPLOYMENT_BENEFIT
    application.pay_subsidy_granted = True
    application.pay_subsidy_percent = 50
    application.apprenticeship_program = False
    application.save()
    response = api_client.get(get_detail_url(application))
    assert json.loads(json.dumps(response.data["attachment_requirements"])) == [
        ["employment_contract", "required"],
        ["helsinki_benefit_voucher", "optional"],
        ["pay_subsidy_decision", "required"],
    ]
