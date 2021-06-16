from rest_framework import serializers

from companies.models import Company


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            "id",
            "name",
            "business_id",
            "company_form",
            "industry",
            "street_address",
            "postcode",
            "city",
            "manual_company_form",
            "manual_industry",
            "manual_street_address",
            "manual_postcode",
            "manual_city",
        ]
