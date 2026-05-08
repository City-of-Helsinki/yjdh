from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from applications.enums import OrganizationType
from companies.models import Company


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            "id",
            "name",
            "business_id",
            "company_form",
            "company_form_code",
            "street_address",
            "postcode",
            "city",
            "bank_account_number",
            "organization_type",
            "industry",
            "industry_code",
        ]

    organization_type = serializers.SerializerMethodField(
        "get_organization_type",
        help_text="The general type of the applicant organization",
    )

    @extend_schema_field(serializers.ChoiceField(choices=OrganizationType.choices))
    def get_organization_type(self, obj):
        return OrganizationType.resolve_organization_type(obj.company_form_code)


class CompanySearchSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)
    business_id = serializers.CharField(max_length=20)


class UpdateCompanyIndustryCodeSerializer(serializers.Serializer):
    industry_code = serializers.CharField(max_length=10)
    industry = serializers.CharField(max_length=255, allow_blank=True, default="")

    def update(self, instance, validated_data):
        instance.industry_code = validated_data["industry_code"]
        instance.industry = validated_data["industry"]
        instance.save(update_fields=["industry_code", "industry"])
        return instance
