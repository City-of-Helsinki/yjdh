from applications.enums import OrganizationType
from applications.models import Application, ApplicationBasis, DeMinimisAid
from common.exceptions import BenefitAPIException
from companies.api.v1.serializers import CompanySerializer
from companies.models import Company
from django.db import transaction
from rest_framework import serializers


class ApplicationBasisSerializer(serializers.ModelSerializer):
    """
    Only the unique identifier is exposed through the API.
    """

    class Meta:
        model = ApplicationBasis
        fields = [
            "identifier",
        ]


class DeMinimisAidSerializer(serializers.ModelSerializer):
    """
    De minimis aid objects are meant to be edited together with their Application object.
    The "ordering" field is not editable. The ordering of the DeMinimisAid objects is determined
    by their order in the "de_minimis_aid_set" list in the Application.
    """

    class Meta:
        model = DeMinimisAid
        fields = [
            "id",
            "granter",
            "granted_at",
            "amount",
            "ordering",
        ]
        read_only_fields = [
            "ordering",
        ]


class ApplicationSerializer(serializers.ModelSerializer):

    """
    Fields in the Company model come from YTJ/other source and are not editable by user
    """

    company = CompanySerializer(read_only=True)

    bases = serializers.SlugRelatedField(
        many=True,
        slug_field="identifier",
        queryset=ApplicationBasis.objects.filter(is_active=True),
    )

    de_minimis_aid_set = DeMinimisAidSerializer(
        many=True, required=False, allow_null=True
    )

    """
    To be used when a logged-in application handler creates a new application based on a paper application
    received via mail. Ordinary applicants can only create applications for their own company.
    """
    create_application_for_company = serializers.PrimaryKeyRelatedField(
        write_only=True, required=False, queryset=Company.objects.all()
    )

    class Meta:
        model = Application
        fields = [
            "id",
            "status",
            "company",
            "company_name",
            "organization_type",
            "bases",
            "available_bases",
            "official_company_street_address",
            "official_company_city",
            "official_company_postcode",
            "use_alternative_address",
            "alternative_company_street_address",
            "alternative_company_city",
            "alternative_company_postcode",
            "company_bank_account_number",
            "company_contact_person_phone_number",
            "company_contact_person_email",
            "association_has_business_activities",
            "applicant_language",
            "co_operation_negotiations",
            "co_operation_negotiations_description",
            "apprenticeship_program",
            "archived",
            "benefit_type",
            "start_date",
            "end_date",
            "de_minimis_aid",
            "de_minimis_aid_set",
            "create_application_for_company",
        ]
        read_only_fields = [
            "available_bases",
            "company_name",
            "official_company_street_address",
            "official_company_city",
            "official_company_postcode",
        ]

    organization_type = serializers.SerializerMethodField("get_organization_type")

    available_bases = serializers.SerializerMethodField("get_available_bases")

    def get_organization_type(self, obj):
        return OrganizationType.resolve_organization_type(obj.company.company_form)

    def get_available_bases(self, obj):
        return [
            basis.identifier
            for basis in ApplicationBasis.objects.filter(is_active=True)
        ]

    @transaction.atomic
    def update(self, instance, validated_data):
        de_minimis_data = validated_data.pop("de_minimis_aid_set", None)
        application = super().update(instance, validated_data)
        if de_minimis_data is not None:
            # if it is a patch request that didn't have de_minimis_data_set, do nothing
            self._update_de_minimis_aid(application, de_minimis_data)
        return application

    @transaction.atomic
    def create(self, validated_data):
        de_minimis_data = validated_data.pop("de_minimis_aid_set")
        company = self.assign_company(validated_data)
        application = super().create(validated_data)
        self.assign_default_fields_from_company(application, company)
        self._update_de_minimis_aid(application, de_minimis_data)
        return application

    def assign_company(self, validated_data):
        """
        Company field is read_only. When creating a new application, assign company.
        """
        if self.logged_in_user_is_admin():
            # Only handlers can create applications for any company
            validated_data["company"] = Company.objects.get(
                validated_data["create_application_for_company"]
            )
        else:
            validated_data["company"] = self.get_logged_in_user_company()
        return validated_data["company"]

    def assign_default_fields_from_company(self, application, company):
        application.company_name = company.name
        application.company_form = company.company_form
        application.official_company_street_address = company.street_address
        application.official_company_postcode = company.postcode
        application.official_company_city = company.city
        application.save()

    def _update_de_minimis_aid(self, application, de_minimis_data):
        serializer = DeMinimisAidSerializer(data=de_minimis_data, many=True)
        if not serializer.is_valid():
            raise BenefitAPIException(
                f"Reading de minimis data failed: {serializer.errors}"
            )
        for idx, aid_item in enumerate(serializer.validated_data):
            aid_item["application_id"] = application.pk
            aid_item[
                "ordering"
            ] = idx  # use the ordering defined in the JSON sent by the client
        saved_aid = serializer.save()
        # Clear obsolete DeMinimisAid objects from the database.
        # The request must always contain all the DeMinimisAid objects for this application.
        application.de_minimis_aid_set.all().exclude(
            pk__in=[obj.pk for obj in saved_aid]
        ).delete()

    def logged_in_user_is_admin(self):
        # TODO: user management
        return False

    def get_logged_in_user_company(self):
        # TODO: user management
        return Company.objects.all().order_by("pk").first()
