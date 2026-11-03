from rest_framework import serializers

from companies.models import Company, Office


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            "id",
            "name",
            "business_id",
            "organization_type",
            "company_form",
            "industry",
            "street_address",
            "postcode",
            "city",
        ]


class OfficeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Office
        fields = ["name"]
