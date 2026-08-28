from types import SimpleNamespace

import pytest
from django.core.exceptions import ValidationError
from rest_framework import serializers

from applications.api.v1.serializers import (
    EmployerApplicationSerializer,
    EmployerApplicationStatusValidator,
    EmployerSummerVoucherSerializer,
    YouthApplicationSerializer,
)
from applications.enums import AttachmentType, EmployerApplicationStatus
from applications.models import School, validate_name, YouthApplication
from applications.tests.test_applications_api import get_detail_url
from shared.common.tests.names import INVALID_NAMES, VALID_NAMES


@pytest.mark.django_db
def test_validate_name_with_all_listed_schools(school_list):
    for school in School.objects.all():
        validate_name(school.name)


@pytest.mark.django_db
@pytest.mark.parametrize(
    "name",
    VALID_NAMES
    + [
        "Jokin muu koulu",
        "Testikoulu",
        "Testikoulu 1",
        "Testikoulu: Arabian yläaste",
        "Yläaste (Arabia)",
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
@pytest.mark.parametrize("name", INVALID_NAMES)
def test_validate_name_with_invalid_unlisted_school(name):
    with pytest.raises(ValidationError):
        validate_name(name)


@pytest.mark.parametrize(
    "from_status,to_status",
    [
        # Direct happy path:
        (EmployerApplicationStatus.DRAFT, EmployerApplicationStatus.SUBMITTED),
        (
            EmployerApplicationStatus.SUBMITTED,
            EmployerApplicationStatus.APPLICATION_HANDLING,
        ),
        (
            EmployerApplicationStatus.APPLICATION_HANDLING,
            EmployerApplicationStatus.PAYMENT_REVIEW,
        ),
        (
            EmployerApplicationStatus.PAYMENT_REVIEW,
            EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
        ),
        (
            EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
            EmployerApplicationStatus.SENT_FOR_PAYMENT,
        ),
        # Additional information retrieval paths:
        (
            EmployerApplicationStatus.APPLICATION_HANDLING,
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
        ),
        (
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
        ),
        (
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
            EmployerApplicationStatus.APPLICATION_HANDLING,
        ),
        # Allowed application cancellations (meant for employer):
        (
            EmployerApplicationStatus.SUBMITTED,
            EmployerApplicationStatus.CANCELLED,
        ),
        (
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
            EmployerApplicationStatus.CANCELLED,
        ),
        (
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
            EmployerApplicationStatus.CANCELLED,
        ),
        # Allowed application rejections (meant for handlers, approvers and possibly automation):
        (
            EmployerApplicationStatus.APPLICATION_HANDLING,
            EmployerApplicationStatus.REJECTED,
        ),
        (
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
            EmployerApplicationStatus.REJECTED,
        ),
        (EmployerApplicationStatus.PAYMENT_REVIEW, EmployerApplicationStatus.REJECTED),
        # Allowed backwards/return paths in process:
        (
            # Only if no additional information has been provided:
            EmployerApplicationStatus.APPLICATION_HANDLING,
            EmployerApplicationStatus.SUBMITTED,
        ),
        (
            # Only if additional information has been provided:
            EmployerApplicationStatus.APPLICATION_HANDLING,
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
        ),
        (
            # Only if no additional information has been provided:
            EmployerApplicationStatus.REJECTED,
            EmployerApplicationStatus.SUBMITTED,
        ),
        (
            # Only if additional information has been provided:
            EmployerApplicationStatus.REJECTED,
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
        ),
        (
            # Only if no additional information has been provided:
            EmployerApplicationStatus.PAYMENT_REVIEW,
            EmployerApplicationStatus.SUBMITTED,
        ),
        (
            # Only if additional information has been provided:
            EmployerApplicationStatus.PAYMENT_REVIEW,
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
        ),
        (
            EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
            EmployerApplicationStatus.PAYMENT_REVIEW,
        ),
        # Self-looping in same status is allowed:
        (EmployerApplicationStatus.DRAFT, EmployerApplicationStatus.DRAFT),
        (EmployerApplicationStatus.SUBMITTED, EmployerApplicationStatus.SUBMITTED),
        (
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
        ),
        (
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
        ),
        (
            EmployerApplicationStatus.APPLICATION_HANDLING,
            EmployerApplicationStatus.APPLICATION_HANDLING,
        ),
        (
            EmployerApplicationStatus.PAYMENT_REVIEW,
            EmployerApplicationStatus.PAYMENT_REVIEW,
        ),
        (
            EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
            EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
        ),
        (
            EmployerApplicationStatus.SENT_FOR_PAYMENT,
            EmployerApplicationStatus.SENT_FOR_PAYMENT,
        ),
        (EmployerApplicationStatus.REJECTED, EmployerApplicationStatus.REJECTED),
        (EmployerApplicationStatus.CANCELLED, EmployerApplicationStatus.CANCELLED),
    ],
)
def test_employer_application_status_validator_success(
    from_status: EmployerApplicationStatus, to_status: EmployerApplicationStatus
):
    validator = EmployerApplicationStatusValidator()
    # Fake a serializer_field which has parent, parent.instance and parent.instance.status
    serializer_field = SimpleNamespace(
        parent=SimpleNamespace(instance=SimpleNamespace(status=from_status))
    )

    assert validator(to_status, serializer_field) == to_status


@pytest.mark.parametrize(
    "from_status,to_status",
    [
        # DRAFT can only be changed to SUBMITTED and nothing else
        (
            EmployerApplicationStatus.DRAFT,
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
        ),
        (
            EmployerApplicationStatus.DRAFT,
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
        ),
        (
            EmployerApplicationStatus.DRAFT,
            EmployerApplicationStatus.APPLICATION_HANDLING,
        ),
        (EmployerApplicationStatus.DRAFT, EmployerApplicationStatus.PAYMENT_REVIEW),
        (
            EmployerApplicationStatus.DRAFT,
            EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
        ),
        (EmployerApplicationStatus.DRAFT, EmployerApplicationStatus.SENT_FOR_PAYMENT),
        (EmployerApplicationStatus.DRAFT, EmployerApplicationStatus.REJECTED),
        (EmployerApplicationStatus.DRAFT, EmployerApplicationStatus.CANCELLED),
        # No jumping from SUBMITTED over parts of the process:
        (EmployerApplicationStatus.SUBMITTED, EmployerApplicationStatus.DRAFT),
        (
            EmployerApplicationStatus.SUBMITTED,
            EmployerApplicationStatus.PAYMENT_REVIEW,
        ),
        (
            EmployerApplicationStatus.SUBMITTED,
            EmployerApplicationStatus.REJECTED,
        ),
        (
            EmployerApplicationStatus.SUBMITTED,
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
        ),
        (
            EmployerApplicationStatus.SUBMITTED,
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
        ),
        (
            EmployerApplicationStatus.SUBMITTED,
            EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
        ),
        (
            EmployerApplicationStatus.SUBMITTED,
            EmployerApplicationStatus.SENT_FOR_PAYMENT,
        ),
        # No jumping from ADDITIONAL_INFORMATION_PROVIDED over parts of the process:
        (
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
            EmployerApplicationStatus.DRAFT,
        ),
        (
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
            EmployerApplicationStatus.SUBMITTED,
        ),
        (
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
            EmployerApplicationStatus.PAYMENT_REVIEW,
        ),
        (
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
            EmployerApplicationStatus.REJECTED,
        ),
        (
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
        ),
        (
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
            EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
        ),
        (
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
            EmployerApplicationStatus.SENT_FOR_PAYMENT,
        ),
        # No going back from CANCELLED:
        (EmployerApplicationStatus.CANCELLED, EmployerApplicationStatus.DRAFT),
        (
            EmployerApplicationStatus.CANCELLED,
            EmployerApplicationStatus.SUBMITTED,
        ),
        (
            EmployerApplicationStatus.CANCELLED,
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
        ),
        (
            EmployerApplicationStatus.CANCELLED,
            EmployerApplicationStatus.APPLICATION_HANDLING,
        ),
        (
            EmployerApplicationStatus.CANCELLED,
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
        ),
        (EmployerApplicationStatus.CANCELLED, EmployerApplicationStatus.REJECTED),
        (EmployerApplicationStatus.CANCELLED, EmployerApplicationStatus.PAYMENT_REVIEW),
        (
            EmployerApplicationStatus.CANCELLED,
            EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
        ),
        (
            EmployerApplicationStatus.CANCELLED,
            EmployerApplicationStatus.SENT_FOR_PAYMENT,
        ),
        # No jumping from ADDITIONAL_INFORMATION_REQUESTED over parts of the process:
        (
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
            EmployerApplicationStatus.DRAFT,
        ),
        (
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
            EmployerApplicationStatus.SUBMITTED,
        ),
        (
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
            EmployerApplicationStatus.APPLICATION_HANDLING,
        ),
        (
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
            EmployerApplicationStatus.PAYMENT_REVIEW,
        ),
        (
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
            EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
        ),
        (
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
            EmployerApplicationStatus.SENT_FOR_PAYMENT,
        ),
        # No jumping from PAYMENT_REVIEW over parts of the process:
        (EmployerApplicationStatus.PAYMENT_REVIEW, EmployerApplicationStatus.DRAFT),
        (EmployerApplicationStatus.PAYMENT_REVIEW, EmployerApplicationStatus.CANCELLED),
        (
            EmployerApplicationStatus.PAYMENT_REVIEW,
            EmployerApplicationStatus.SENT_FOR_PAYMENT,
        ),
        (
            EmployerApplicationStatus.PAYMENT_REVIEW,
            EmployerApplicationStatus.APPLICATION_HANDLING,
        ),
        (
            EmployerApplicationStatus.PAYMENT_REVIEW,
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
        ),
        # No going back from SENT_FOR_PAYMENT:
        (EmployerApplicationStatus.SENT_FOR_PAYMENT, EmployerApplicationStatus.DRAFT),
        (
            EmployerApplicationStatus.SENT_FOR_PAYMENT,
            EmployerApplicationStatus.CANCELLED,
        ),
        (
            EmployerApplicationStatus.SENT_FOR_PAYMENT,
            EmployerApplicationStatus.SUBMITTED,
        ),
        (
            EmployerApplicationStatus.SENT_FOR_PAYMENT,
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
        ),
        (
            EmployerApplicationStatus.SENT_FOR_PAYMENT,
            EmployerApplicationStatus.APPLICATION_HANDLING,
        ),
        (
            EmployerApplicationStatus.SENT_FOR_PAYMENT,
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
        ),
        (
            EmployerApplicationStatus.SENT_FOR_PAYMENT,
            EmployerApplicationStatus.REJECTED,
        ),
        (
            EmployerApplicationStatus.SENT_FOR_PAYMENT,
            EmployerApplicationStatus.PAYMENT_REVIEW,
        ),
        (
            EmployerApplicationStatus.SENT_FOR_PAYMENT,
            EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
        ),
        # No jumping from ACCEPTED_FOR_PAYMENT over parts of the process:
        (
            EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
            EmployerApplicationStatus.DRAFT,
        ),
        (
            EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
            EmployerApplicationStatus.CANCELLED,
        ),
        (
            EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
            EmployerApplicationStatus.SUBMITTED,
        ),
        (
            EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED,
        ),
        (
            EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
            EmployerApplicationStatus.APPLICATION_HANDLING,
        ),
        (
            EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
        ),
        (
            EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
            EmployerApplicationStatus.REJECTED,
        ),
        # No jumping from REJECTED over parts of the process:
        (EmployerApplicationStatus.REJECTED, EmployerApplicationStatus.DRAFT),
        (EmployerApplicationStatus.REJECTED, EmployerApplicationStatus.CANCELLED),
        (
            EmployerApplicationStatus.REJECTED,
            EmployerApplicationStatus.APPLICATION_HANDLING,
        ),
        (
            EmployerApplicationStatus.REJECTED,
            EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED,
        ),
        (EmployerApplicationStatus.REJECTED, EmployerApplicationStatus.PAYMENT_REVIEW),
        (
            EmployerApplicationStatus.REJECTED,
            EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
        ),
        (
            EmployerApplicationStatus.REJECTED,
            EmployerApplicationStatus.SENT_FOR_PAYMENT,
        ),
        # No jumping from APPLICATION_HANDLING over parts of the process:
        (
            EmployerApplicationStatus.APPLICATION_HANDLING,
            EmployerApplicationStatus.DRAFT,
        ),
        (
            EmployerApplicationStatus.APPLICATION_HANDLING,
            EmployerApplicationStatus.CANCELLED,
        ),
        (
            EmployerApplicationStatus.APPLICATION_HANDLING,
            EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT,
        ),
        (
            EmployerApplicationStatus.APPLICATION_HANDLING,
            EmployerApplicationStatus.SENT_FOR_PAYMENT,
        ),
    ],
)
def test_employer_application_status_validator_failure(
    from_status: EmployerApplicationStatus, to_status: EmployerApplicationStatus
):
    validator = EmployerApplicationStatusValidator()
    # Fake a serializer_field which has parent, parent.instance and parent.instance.status
    serializer_field = SimpleNamespace(
        parent=SimpleNamespace(instance=SimpleNamespace(status=from_status))
    )

    with pytest.raises(serializers.ValidationError):
        validator(to_status, serializer_field)


@pytest.mark.django_db
@pytest.mark.parametrize(
    "from_status,to_status,expected_code",
    [
        (EmployerApplicationStatus.DRAFT, EmployerApplicationStatus.SUBMITTED, 200),
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
