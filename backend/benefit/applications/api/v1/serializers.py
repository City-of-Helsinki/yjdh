from datetime import date

from applications.enums import ApplicationStatus, BenefitType, OrganizationType
from applications.models import (
    Application,
    ApplicationBasis,
    ApplicationLogEntry,
    DeMinimisAid,
)
from common.exceptions import BenefitAPIException
from companies.api.v1.serializers import CompanySerializer
from companies.models import Company
from django.db import transaction
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers


class ApplicationStatusValidator:
    requires_context = True

    APPLICATION_STATUS_TRANSITIONS = {
        ApplicationStatus.DRAFT: (ApplicationStatus.RECEIVED,),
        ApplicationStatus.RECEIVED: (
            ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED,
            ApplicationStatus.CANCELLED,
            ApplicationStatus.ACCEPTED,
            ApplicationStatus.REJECTED,
        ),
        ApplicationStatus.ADDITIONAL_INFORMATION_NEEDED: (
            ApplicationStatus.RECEIVED,
            ApplicationStatus.CANCELLED,
        ),
        ApplicationStatus.CANCELLED: (),
        ApplicationStatus.ACCEPTED: (),
        ApplicationStatus.REJECTED: (),
    }

    def __call__(self, value, serializer_field):
        if application := serializer_field.parent.instance:
            # In case it's an update operation, validate with the current status in database
            if (
                value != application.status
                and value not in self.APPLICATION_STATUS_TRANSITIONS[application.status]
            ):
                raise serializers.ValidationError(
                    _(
                        f"Application state transition not allowed: {application.status} to {value}"
                    )
                )
        else:
            if value != ApplicationStatus.DRAFT:
                raise serializers.ValidationError(
                    _("Initial status of application must be draft")
                )

        return value


class ApplicationBasisSerializer(serializers.ModelSerializer):
    """
    Only the unique identifier is exposed through the API.
    """

    class Meta:
        model = ApplicationBasis
        fields = [
            "identifier",
        ]
        extra_kwargs = {
            "identifier": {
                "help_text": "Unique slug that identifies the basis",
            }
        }


class DeMinimisAidSerializer(serializers.ModelSerializer):
    """
    De minimis aid objects are meant to be edited together with their Application object.
    The "ordering" field is not editable and is ignored if present in POST/PUT data.
    The ordering of the DeMinimisAid objects is determined by their order in the "de_minimis_aid_set" list
    in the Application.
    """

    MAX_AID_AMOUNT = 200000
    amount = serializers.DecimalField(
        max_digits=DeMinimisAid.amount.field.max_digits,
        decimal_places=DeMinimisAid.amount.field.decimal_places,
        min_value=1,
        max_value=MAX_AID_AMOUNT,
        help_text="see MAX_AMOUNT",
    )

    def validate_granted_at(self, value):
        min_date = date(date.today().year - 4, 1, 1)
        if value < min_date:
            raise serializers.ValidationError("Grant date too much in past")
        elif value > date.today():
            raise serializers.ValidationError("Grant date can not be in the future")
        return value

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
        extra_kwargs = {
            "granter": {
                "help_text": "Granter of the benefit",
            },
            "granted_at": {
                "help_text": "Date max. four years into past",
            },
            "ordering": {
                "help_text": "Note: read-only field, ignored on input",
            },
        }


class ApplicationSerializer(serializers.ModelSerializer):

    """
    Fields in the Company model come from YTJ/other source and are not editable by user, and are listed
    in read_only_fields. If sent in the request, these fields are ignored.
    """

    status = serializers.ChoiceField(
        choices=ApplicationStatus.choices,
        validators=[ApplicationStatusValidator()],
        help_text="Status of the application, visible to the applicant",
    )
    company = CompanySerializer(read_only=True)

    bases = serializers.SlugRelatedField(
        many=True,
        slug_field="identifier",
        queryset=ApplicationBasis.objects.filter(is_active=True),
        help_text="List of application basis identifiers",
    )

    de_minimis_aid_set = DeMinimisAidSerializer(
        many=True,
        help_text="List of de minimis aid associated with this application."
        "Total amount must be less than MAX_AID_AMOUNT",
    )

    create_application_for_company = serializers.PrimaryKeyRelatedField(
        write_only=True,
        required=False,
        queryset=Company.objects.all(),
        help_text=(
            "To be used when a logged-in application handler creates a new application based on a paper application"
            "received via mail. Ordinary applicants can only create applications for their own company."
        ),
    )

    class Meta:
        model = Application
        fields = [
            "id",
            "status",
            "company",
            "company_name",
            "company_form",
            "organization_type",
            "bases",
            "available_bases",
            "available_benefit_types",
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
            "company_form",
            "official_company_street_address",
            "official_company_city",
            "official_company_postcode",
            "available_benefit_types",
        ]
        extra_kwargs = {
            "company_name": {
                "help_text": "The application should retain the Company name, as it was at the time the"
                " application was created, to maintain historical accuracy.",
            },
            "company_form": {
                "help_text": "Company city from official sources (YTJ) at the time the application was created",
            },
            "official_company_street_address": {
                "help_text": "Company street address from official sources (YTJ/other) at"
                "the time the application was created",
            },
            "official_company_city": {
                "help_text": "Company city from official sources (YTJ/other) at"
                "the time the application was created",
            },
            "official_company_postcode": {
                "help_text": "Company post code from official sources (YTJ/other) at"
                "the time the application was created",
            },
            "use_alternative_address": {
                "help_text": "The user has an option of using an alternative address."
                "This will then be used instead of the address fetched from YTJ/PRH.",
            },
            "alternative_company_street_address": {
                "help_text": "User-supplied address, to be used in Helsinki Benefit related issues",
            },
            "alternative_company_city": {
                "help_text": "User-supplied city, to be used in Helsinki Benefit related issues",
            },
            "alternative_company_postcode": {
                "help_text": "User-supplied postcode, to be used in Helsinki Benefit related issues",
            },
            "company_bank_account_number": {
                "help_text": "IBAN formatted bank account number",
            },
            "company_contact_person_phone_number": {
                "help_text": "Phone number of the contact person",
            },
            "company_contact_person_email": {
                "help_text": "Email address of the contact person",
            },
            "association_has_business_activities": {
                "help_text": "field is visible and yes/no answer is required/allowed"
                "only if applicant is an association",
            },
            "applicant_language": {
                "help_text": "Language to be used when contacting the contact person",
            },
            "co_operation_negotiations": {
                "help_text": "If set to True, then the negotiations description must be filled",
            },
            "co_operation_negotiations_description": {
                "help_text": "Free text entered by the applicant",
            },
            "apprenticeship_program": {
                "help_text": "Is the employee in apprenticeship program?",
            },
            "archived": {
                "help_text": "Flag indicating the application is archived and should not usually be shown to the user",
            },
            "benefit_type": {
                "help_text": "Benefit type of this application",
            },
            "start_date": {
                "help_text": "Must be within the current year.",
            },
            "end_date": {
                "help_text": "Must be after the start date.",
            },
            "de_minimis_aid": {
                "help_text": "Null indicates user has no yet made the selection",
            },
        }

    organization_type = serializers.SerializerMethodField(
        "get_organization_type",
        help_text="The general type of the applicant organization",
    )

    available_bases = serializers.SerializerMethodField(
        "get_available_bases", help_text="List of available application basis slugs"
    )

    available_benefit_types = serializers.SerializerMethodField(
        "get_available_benefit_types",
        help_text="Available benefit types depend on organization type of the applicant",
    )

    @extend_schema_field(serializers.ChoiceField(choices=OrganizationType.choices))
    def get_organization_type(self, obj):
        return OrganizationType.resolve_organization_type(obj.company.company_form)

    @extend_schema_field(ApplicationBasisSerializer(many=True))
    def get_available_bases(self, obj):
        return [
            basis.identifier
            for basis in ApplicationBasis.objects.filter(is_active=True)
        ]

    def _validate_de_minimis_aid_set(self, company, de_minimis_aid, de_minimis_aid_set):
        """
        Validate the de minimis aid parameters:
        * company: the organization applying for the benefit
        * de_minimis_aid: boolean yes/no/null value
        * de_minimis_aid_set: the DeMinimisAid objects represented as list of dicts
          (at this point, the individual dicts have been already valided by DeMinimisAidSerializer
        """
        if (
            OrganizationType.resolve_organization_type(company.company_form)
            == OrganizationType.ASSOCIATION
            and de_minimis_aid is not None
        ):
            raise serializers.ValidationError(
                {
                    "de_minimis_aid_set": _(
                        "This application has non-null de_minimis_aid but is applied by an association"
                    )
                }
            )

        if de_minimis_aid and not de_minimis_aid_set:
            raise serializers.ValidationError(
                {
                    "de_minimis_aid_set": _(
                        "This application has de_minimis_aid set but does not define any"
                    )
                }
            )

        if de_minimis_aid in (None, False) and de_minimis_aid_set:
            raise serializers.ValidationError(
                {
                    "de_minimis_aid_set": _(
                        "This application can not have de minimis aid"
                    )
                }
            )

        total_aid = sum([item["amount"] for item in de_minimis_aid_set])
        if total_aid > DeMinimisAidSerializer.MAX_AID_AMOUNT:
            raise serializers.ValidationError(
                {"de_minimis_aid_set": "Total amount of de minimis aid too large"}
            )

    def _validate_date_range(self, start_date, end_date):
        # keeping all start/end date validation together
        if start_date and start_date < date(date.today().year, 1, 1):
            raise serializers.ValidationError(
                {"start_date": _("start_date must be within the current year")}
            )
        if end_date:
            if start_date and end_date < start_date:
                raise serializers.ValidationError(
                    {
                        "end_date": _(
                            "application end_date can not be less than start_date"
                        )
                    }
                )
            if end_date < date(date.today().year, 1, 1):
                raise serializers.ValidationError(
                    {"end_date": _("end_date must be within the current year")}
                )

    def _validate_co_operation_negotiations(
        self, co_operation_negotiations, co_operation_negotiations_description
    ):
        if not co_operation_negotiations and co_operation_negotiations_description:
            raise serializers.ValidationError(
                {
                    "co_operation_negotiations_description": _(
                        "This application can not have a description for co-operation negotiations"
                    )
                }
            )

    # Fields that may be null/blank while the application is draft, but
    # must be filled before submitting the application for processing
    REQUIRED_FIELDS_FOR_SUBMITTED_APPLICATIONS = [
        "company_bank_account_number",
        "company_contact_person_phone_number",
        "company_contact_person_email",
        "association_has_business_activities",
        "co_operation_negotiations",
        "apprenticeship_program",
        "de_minimis_aid",
        "benefit_type",
        "start_date",
        "end_date",
        "bases",
    ]

    def _validate_non_draft_required_fields(self, data):
        if data["status"] == ApplicationStatus.DRAFT:
            return
        # must have start_date and end_date before status can change
        # newly created applications are always DRAFT
        required_fields = self.REQUIRED_FIELDS_FOR_SUBMITTED_APPLICATIONS[:]
        if (
            OrganizationType.resolve_organization_type(
                self.get_company(data).company_form
            )
            == OrganizationType.ASSOCIATION
        ):
            required_fields.append("association_has_business_activities")

        for field_name in required_fields:
            if data[field_name] in [None, "", []]:
                raise serializers.ValidationError(
                    {
                        field_name: _(
                            "This field is required before submitting the application"
                        )
                    }
                )

    def _validate_association_has_business_activities(
        self, company, association_has_business_activities
    ):
        if (
            OrganizationType.resolve_organization_type(company.company_form)
            == OrganizationType.COMPANY
            and association_has_business_activities is not None
        ):
            raise serializers.ValidationError(
                {
                    "association_has_business_activities": _(
                        "This field can be set for associations only"
                    )
                }
            )

    @extend_schema_field(serializers.ChoiceField(choices=BenefitType.choices))
    def get_available_benefit_types(self, obj):
        return [
            str(item)
            for item in ApplicationSerializer._get_available_benefit_types(
                obj.company, obj.association_has_business_activities
            )
        ]

    def _validate_benefit_type(
        self, company, benefit_type, association_has_business_activities
    ):
        if benefit_type == "":
            return
        if benefit_type not in ApplicationSerializer._get_available_benefit_types(
            company, association_has_business_activities
        ):
            raise serializers.ValidationError(
                {"benefit_type": _("This benefit type can not be selected")}
            )

    @staticmethod
    def _get_available_benefit_types(company, association_has_business_activities):
        """
        Make the logic of determining available benefit types available both for generating the list of
        benefit types and validating the incoming data
        """
        if (
            OrganizationType.resolve_organization_type(company.company_form)
            == OrganizationType.ASSOCIATION
            and not association_has_business_activities
        ):
            return [BenefitType.SALARY_BENEFIT]
        else:
            return [
                BenefitType.SALARY_BENEFIT,
                BenefitType.COMMISSION_BENEFIT,
                BenefitType.EMPLOYMENT_BENEFIT,
            ]

    def validate(self, data):
        """ """
        company = self.get_company(data)
        self._validate_date_range(data["start_date"], data["end_date"])
        self._validate_co_operation_negotiations(
            data["co_operation_negotiations"],
            data["co_operation_negotiations_description"],
        )
        self._validate_de_minimis_aid_set(
            company, data["de_minimis_aid"], data["de_minimis_aid_set"]
        )
        self._validate_association_has_business_activities(
            company, data["association_has_business_activities"]
        )
        self._validate_benefit_type(
            company, data["benefit_type"], data["association_has_business_activities"]
        )
        self._validate_non_draft_required_fields(data)
        return data

    @transaction.atomic
    def update(self, instance, validated_data):
        de_minimis_data = validated_data.pop("de_minimis_aid_set", None)
        if validated_data["status"] != instance.status:
            ApplicationLogEntry.objects.create(
                application=instance,
                from_status=instance.status,
                to_status=validated_data["status"],
            )
        application = super().update(instance, validated_data)
        if de_minimis_data is not None:
            # if it is a patch request that didn't have de_minimis_data_set, do nothing
            self._update_de_minimis_aid(application, de_minimis_data)

        return application

    @transaction.atomic
    def create(self, validated_data):
        de_minimis_data = validated_data.pop("de_minimis_aid_set")
        validated_data["company"] = self.get_company_for_new_application(validated_data)
        application = super().create(validated_data)
        self.assign_default_fields_from_company(application, validated_data["company"])
        self._update_de_minimis_aid(application, de_minimis_data)
        return application

    def get_company_for_new_application(self, validated_data):
        """
        Company field is read_only. When creating a new application, assign company.
        """
        if self.logged_in_user_is_admin():
            # Only handlers can create applications for any company
            return Company.objects.get(validated_data["create_application_for_company"])
        else:
            return self.get_logged_in_user_company()

    def get_company(self, validated_data):
        if self.instance:
            return self.instance.company
        else:
            return self.get_company_for_new_application(validated_data)

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
        # Clear the previous DeMinimisAid objects from the database.
        # The request must always contain all the DeMinimisAid objects for this application.
        application.de_minimis_aid_set.all().delete()
        for idx, aid_item in enumerate(serializer.validated_data):
            aid_item["application_id"] = application.pk
            aid_item[
                "ordering"
            ] = idx  # use the ordering defined in the JSON sent by the client
        serializer.save()

    def logged_in_user_is_admin(self):
        # TODO: user management
        return False

    def get_logged_in_user_company(self):
        # TODO: user management
        return Company.objects.all().order_by("pk").first()
