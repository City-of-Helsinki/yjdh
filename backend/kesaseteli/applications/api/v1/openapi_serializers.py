"""Schema-only serializers for Kesäseteli OpenAPI contract shapes."""

from rest_framework import serializers

from applications.enums import APPLICATION_LANGUAGE_CHOICES, AttachmentType
from applications.target_groups import get_target_group_choices


class YouthApplicationCreateWithoutSsnRequestSerializer(serializers.Serializer):
    """Request body for creating a youth application without SSN."""

    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    school = serializers.CharField()
    phone_number = serializers.CharField()
    postcode = serializers.CharField()
    language = serializers.ChoiceField(choices=APPLICATION_LANGUAGE_CHOICES)
    non_vtj_birthdate = serializers.DateField()
    non_vtj_home_municipality = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
    )
    additional_info_description = serializers.CharField()
    target_group = serializers.ChoiceField(choices=get_target_group_choices())


class YouthApplicationFetchEmployeeDataRequestSerializer(serializers.Serializer):
    """Request body for fetching employee data for a summer voucher."""

    employer_summer_voucher_id = serializers.UUIDField()
    employee_name = serializers.CharField()
    summer_voucher_serial_number = serializers.CharField()


class YouthApplicationFetchEmployeeDataResponseSerializer(serializers.Serializer):
    """Response body for employee data lookup."""

    employer_summer_voucher_id = serializers.UUIDField()
    employee_name = serializers.CharField()
    employee_birthdate = serializers.DateField()
    employee_phone_number = serializers.CharField(allow_blank=True)
    employee_home_city = serializers.CharField(allow_blank=True, allow_null=True)
    employee_postcode = serializers.CharField(allow_blank=True)
    employee_school = serializers.CharField(allow_blank=True)


class YouthApplicationIdResponseSerializer(serializers.Serializer):
    """Response body containing the created youth application identifier."""

    id = serializers.UUIDField()


class EmployerSummerVoucherAttachmentUploadRequestSerializer(serializers.Serializer):
    """Request body for uploading an attachment to an employer voucher."""

    attachment_file = serializers.FileField()
    attachment_type = serializers.ChoiceField(choices=AttachmentType.choices)
