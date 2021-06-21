from django.db import transaction
from rest_framework import serializers

from applications.models import Application, SummerVoucher
from applications.services import update_summer_vouchers_using_api_data
from companies.api.v1.serializers import CompanySerializer
from companies.services import get_or_create_company_from_eauth_profile


class SummerVoucherSerializer(serializers.ModelSerializer):
    class Meta:
        model = SummerVoucher
        fields = [
            "id",
            "summer_voucher_id",
            "contact_name",
            "contact_email",
            "work_postcode",
            "employee_name",
            "employee_school",
            "employee_ssn",
            "employee_phone_number",
            "is_unnumbered_summer_voucher",
            "unnumbered_summer_voucher_reason",
        ]


class ApplicationSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    summer_vouchers = SummerVoucherSerializer(
        many=True, required=False, allow_null=True
    )
    status = serializers.CharField(required=False)

    class Meta:
        model = Application
        fields = [
            "id",
            "status",
            "invoicer_name",
            "invoicer_email",
            "invoicer_phone_number",
            "company",
            "summer_vouchers",
        ]

    @transaction.atomic
    def update(self, instance, validated_data):
        request = self.context.get("request")
        summer_vouchers_data = validated_data.pop("summer_vouchers", []) or []
        if request and request.method == "PUT":
            update_summer_vouchers_using_api_data(summer_vouchers_data, instance)

        return super().update(instance, validated_data)

    @transaction.atomic
    def create(self, validated_data):
        user = self.context["request"].user
        company = get_or_create_company_from_eauth_profile(
            user.oidc_profile.eauthorization_profile
        )
        validated_data["company"] = company

        return super().create(validated_data)
