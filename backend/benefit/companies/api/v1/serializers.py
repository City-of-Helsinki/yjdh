from companies.models import Company
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
        ]
