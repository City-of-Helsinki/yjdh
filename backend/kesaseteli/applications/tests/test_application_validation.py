import pytest
from django.core.exceptions import ValidationError

from applications.api.v1.serializers import (
    EmployerApplicationSerializer,
    EmployerSummerVoucherSerializer,
    YouthApplicationSerializer,
)
from applications.enums import AttachmentType, EmployerApplicationStatus
from applications.models import School, validate_name, YouthApplication
from applications.tests.test_applications_api import get_detail_url


@pytest.mark.django_db
def test_validate_name_with_all_listed_schools():
    for school in School.objects.all():
        validate_name(school.name)


@pytest.mark.django_db
@pytest.mark.parametrize(
    "name",
    [
        "Jokin muu koulu",
        "Testikoulu",
    ],
)
def test_validate_name_with_valid_unlisted_school(name):
    validate_name(name)


@pytest.mark.django_db
@pytest.mark.parametrize(
    "vtj_json_field_name", YouthApplicationSerializer.Meta.vtj_data_fields
)
@pytest.mark.parametrize(
    "vtj_json_field_value,expect_error",
    [
        # Valid JSON values
        ("{}", False),
        ("[1, 2, 3, null, false, true, 3.14]", False),
        ('{"a": 1, "b": 2}', False),
        ('{"a": 7, "b": {"c": {"d": [true, false, null, 3, "e"]}}, "x": 1.618}', False),
        # Invalid JSON values
        ("[1,2,]", True),
        ("[1,2],", True),
        ("{a}", True),
        ("{{}}", True),
        ('{"a": 1, "b":}', True),
        # Valid because explicitly allowed
        (None, False),
        ("", False),
    ],
)
def test_validate_youth_application_vtj_data_fields(
    active_youth_application,
    vtj_json_field_name,
    vtj_json_field_value,
    expect_error,
):
    YouthApplication._meta.get_field(vtj_json_field_name)  # Check that field exists
    setattr(active_youth_application, vtj_json_field_name, vtj_json_field_value)

    def clean_vtj_json_field():
        active_youth_application.clean_fields(
            exclude=list(set(YouthApplication._meta.fields) - {vtj_json_field_name})
        )

    if expect_error:
        with pytest.raises(ValidationError):
            clean_vtj_json_field()
    else:
        clean_vtj_json_field()


@pytest.mark.django_db
@pytest.mark.parametrize(
    "name",
    [
        "Testikoulu 1",  # Number is not allowed after the first character
        "Testikoulu: Arabian yläaste",  # Colon is not allowed
        "Yläaste (Arabia)",  # Parentheses are not allowed
    ],
)
def test_validate_name_with_invalid_unlisted_school(name):
    with pytest.raises(ValidationError):
        validate_name(name)


@pytest.mark.django_db
@pytest.mark.parametrize(
    "from_status,to_status,expected_code",
    [
        (EmployerApplicationStatus.DRAFT, EmployerApplicationStatus.SUBMITTED, 200),
        # TODO: To be added after MVP:
        # (
        #     EmployerApplicationStatus.SUBMITTED,
        #     EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
        #     200,
        # ),
        # (EmployerApplicationStatus.SUBMITTED, EmployerApplicationStatus.ACCEPTED, 200),
        # (EmployerApplicationStatus.SUBMITTED, EmployerApplicationStatus.REJECTED, 200),
        # (EmployerApplicationStatus.SUBMITTED, EmployerApplicationStatus.DELETED_BY_CUSTOMER, 200),
        # (EmployerApplicationStatus.SUBMITTED, EmployerApplicationStatus.DRAFT, 400),
        # (EmployerApplicationStatus.ACCEPTED, EmployerApplicationStatus.SUBMITTED, 400),
        # (EmployerApplicationStatus.DELETED_BY_CUSTOMER, EmployerApplicationStatus.ACCEPTED, 400),
        # (EmployerApplicationStatus.REJECTED, EmployerApplicationStatus.DRAFT, 400),
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
    from_status = EmployerApplicationStatus.DRAFT
    to_status = EmployerApplicationStatus.SUBMITTED

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
    summer_voucher.target_group = ""
    summer_voucher.save()

    from_status = EmployerApplicationStatus.DRAFT
    to_status = EmployerApplicationStatus.SUBMITTED

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
    from_status = EmployerApplicationStatus.DRAFT
    to_status = EmployerApplicationStatus.SUBMITTED

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
    from_status = EmployerApplicationStatus.DRAFT
    to_status = EmployerApplicationStatus.SUBMITTED

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
    from_status = EmployerApplicationStatus.DRAFT
    to_status = EmployerApplicationStatus.SUBMITTED

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
