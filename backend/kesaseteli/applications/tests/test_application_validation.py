import pytest
from django.core.exceptions import ValidationError

from applications.api.v1.serializers import (
    EmployerApplicationSerializer,
    EmployerSummerVoucherSerializer,
)
from applications.enums import ApplicationStatus, AttachmentType
from applications.models import School, validate_school
from applications.tests.test_applications_api import get_detail_url


@pytest.mark.django_db
def test_validate_school_with_all_active_schools():
    for school in School.objects.active():
        validate_school(school.name)


@pytest.mark.django_db
def test_validate_school_with_all_deleted_schools():
    for school in School.objects.deleted():
        validate_school(school.name)


@pytest.mark.django_db
@pytest.mark.parametrize(
    "name",
    [
        "Jokin muu koulu",
        "Testikoulu",
    ],
)
def test_validate_school_with_valid_unlisted_school(name):
    validate_school(name)


@pytest.mark.django_db
@pytest.mark.parametrize(
    "name",
    [
        "Testikoulu 1",  # Number is not allowed after the first character
        "Testikoulu: Arabian yläaste",  # Colon is not allowed
        "Yläaste (Arabia)",  # Parentheses are not allowed
    ],
)
def test_validate_school_with_invalid_unlisted_school(name):
    with pytest.raises(ValidationError):
        validate_school(name)


@pytest.mark.django_db
@pytest.mark.parametrize(
    "from_status,to_status,expected_code",
    [
        (ApplicationStatus.DRAFT, ApplicationStatus.SUBMITTED, 200),
        # TODO: To be added after MVP:
        # (
        #     ApplicationStatus.SUBMITTED,
        #     ApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
        #     200,
        # ),
        # (ApplicationStatus.SUBMITTED, ApplicationStatus.ACCEPTED, 200),
        # (ApplicationStatus.SUBMITTED, ApplicationStatus.REJECTED, 200),
        # (ApplicationStatus.SUBMITTED, ApplicationStatus.DELETED_BY_CUSTOMER, 200),
        # (ApplicationStatus.SUBMITTED, ApplicationStatus.DRAFT, 400),
        # (ApplicationStatus.ACCEPTED, ApplicationStatus.SUBMITTED, 400),
        # (ApplicationStatus.DELETED_BY_CUSTOMER, ApplicationStatus.ACCEPTED, 400),
        # (ApplicationStatus.REJECTED, ApplicationStatus.DRAFT, 400),
    ],
)
def test_application_status_change(
    api_client,
    application,
    summer_voucher,
    employment_contract_attachment,
    payslip_attachment,
    from_status,
    to_status,
    expected_code,
):
    application.status = from_status
    application.save()

    data = EmployerApplicationSerializer(application).data
    data["status"] = to_status

    response = api_client.put(
        get_detail_url(application),
        data,
    )

    assert response.status_code == expected_code

    application.refresh_from_db()
    if expected_code == 200:
        assert application.status == to_status
    else:
        assert application.status == from_status


@pytest.mark.django_db
@pytest.mark.parametrize(
    "missing_field",
    EmployerApplicationSerializer.REQUIRED_FIELDS_FOR_SUBMITTED_APPLICATIONS,
)
def test_application_status_change_with_missing_data(
    api_client,
    application,
    summer_voucher,
    employment_contract_attachment,
    payslip_attachment,
    missing_field,
):
    from_status = ApplicationStatus.DRAFT
    to_status = ApplicationStatus.SUBMITTED

    application.status = from_status
    application.save()

    data = EmployerApplicationSerializer(application).data
    data["status"] = to_status
    data.pop(missing_field)

    response = api_client.put(
        get_detail_url(application),
        data,
    )

    assert response.status_code == 400
    assert missing_field in str(response.data).lower()

    application.refresh_from_db()
    assert application.status == from_status


@pytest.mark.django_db
@pytest.mark.parametrize(
    "missing_field",
    EmployerSummerVoucherSerializer.REQUIRED_FIELDS_FOR_SUBMITTED_SUMMER_VOUCHERS,
)
def test_application_status_change_with_missing_summer_voucher_data(
    api_client,
    application,
    summer_voucher,
    employment_contract_attachment,
    payslip_attachment,
    missing_field,
):
    summer_voucher.summer_voucher_exception_reason = ""
    summer_voucher.save()

    from_status = ApplicationStatus.DRAFT
    to_status = ApplicationStatus.SUBMITTED

    application.status = from_status
    application.save()

    data = EmployerApplicationSerializer(application).data
    data["status"] = to_status
    data["summer_vouchers"][0].pop(missing_field)

    response = api_client.put(
        get_detail_url(application),
        data,
    )

    assert response.status_code == 400
    assert missing_field in str(response.data).lower()

    application.refresh_from_db()
    assert application.status == from_status


@pytest.mark.django_db
@pytest.mark.parametrize(
    "missing_attachment",
    AttachmentType.values + ["all"],
)
def test_application_status_change_with_missing_attachments(
    api_client,
    application,
    summer_voucher,
    employment_contract_attachment,
    payslip_attachment,
    missing_attachment,
):
    from_status = ApplicationStatus.DRAFT
    to_status = ApplicationStatus.SUBMITTED

    application.status = from_status
    application.save()

    if missing_attachment == "all":
        for attachment in summer_voucher.attachments.all():
            attachment.attachment_file.delete(save=False)
            attachment.delete()
    else:
        attachment = summer_voucher.attachments.get(attachment_type=missing_attachment)
        attachment.attachment_file.delete(save=False)
        attachment.delete()

    data = EmployerApplicationSerializer(application).data
    data["status"] = to_status

    response = api_client.put(
        get_detail_url(application),
        data,
    )

    assert response.status_code == 400

    if missing_attachment == "all":
        assert "Attachments missing from summer voucher" in str(response.data)
    else:
        assert missing_attachment in str(response.data)

    application.refresh_from_db()
    assert application.status == from_status


@pytest.mark.django_db
def test_separate_invoicer_fields_not_required_if_condition_false(
    api_client,
    application,
    summer_voucher,
    employment_contract_attachment,
    payslip_attachment,
):
    from_status = ApplicationStatus.DRAFT
    to_status = ApplicationStatus.SUBMITTED

    application.status = from_status
    application.is_separate_invoicer = False
    application.invoicer_name = ""
    application.invoicer_email = ""
    application.invoicer_phone_number = ""
    application.save()

    data = EmployerApplicationSerializer(application).data
    data["status"] = to_status

    response = api_client.put(
        get_detail_url(application),
        data,
    )

    assert response.status_code == 200

    application.refresh_from_db()
    assert application.status == to_status


@pytest.mark.django_db
@pytest.mark.parametrize(
    "missing_field",
    ["invoicer_name", "invoicer_email", "invoicer_phone_number"],
)
def test_separate_invoicer_fields_required_if_condition_true(
    api_client,
    application,
    summer_voucher,
    employment_contract_attachment,
    payslip_attachment,
    missing_field,
):
    from_status = ApplicationStatus.DRAFT
    to_status = ApplicationStatus.SUBMITTED

    application.status = from_status
    application.is_separate_invoicer = True
    setattr(application, missing_field, "")
    application.save()

    data = EmployerApplicationSerializer(application).data
    data["status"] = to_status

    response = api_client.put(
        get_detail_url(application),
        data,
    )

    assert response.status_code == 400
    assert missing_field in str(response.data)

    application.refresh_from_db()
    assert application.status == from_status
