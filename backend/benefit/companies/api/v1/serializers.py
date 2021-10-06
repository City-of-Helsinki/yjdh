from applications.enums import OrganizationType
from companies.models import Company
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            "id",
            "name",
            "business_id",
            "company_form",
            "street_address",
            "postcode",
            "city",
            "bank_account_number",
            "organization_type",
        ]

    organization_type = serializers.SerializerMethodField(
        "get_organization_type",
        help_text="The general type of the applicant organization",
    )

    @extend_schema_field(serializers.ChoiceField(choices=OrganizationType.choices))
    def get_organization_type(self, obj):
        return OrganizationType.resolve_organization_type(obj.company_form)
