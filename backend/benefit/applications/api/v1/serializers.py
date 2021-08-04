import re
from datetime import date

from applications.enums import (
    ApplicationStatus,
    AttachmentRequirement,
    AttachmentType,
    BenefitType,
    OrganizationType,
)
from applications.models import (
    Application,
    ApplicationBasis,
    ApplicationLogEntry,
    Attachment,
    DeMinimisAid,
    Employee,
)
from common.exceptions import BenefitAPIException
from common.utils import PhoneNumberField, xgroup
from companies.api.v1.serializers import CompanySerializer
from companies.models import Company
from dateutil.relativedelta import relativedelta
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


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = [
            "id",
            "application",
            "attachment_type",
            "attachment_file",
            "content_type",
            "created_at",
        ]
        read_only_fields = ["created_at"]


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


class EmployeeSerializer(serializers.ModelSerializer):
    """
    Employee objects are meant to be edited together with their Application object.
    """

    SSN_REGEX = r"^(\d{6})[aA+-](\d{3})([0-9A-FHJ-NPR-Ya-fhj-npr-y])$"

    SSN_CHEKSUM = {
        int(k): v
        for k, v in xgroup(
            (
                "0    0    16    H "
                "1    1    17    J "
                "2    2    18    K "
                "3    3    19    L "
                "4    4    20    M "
                "5    5    21    N "
                "6    6    22    P "
                "7    7    23    R "
                "8    8    24    S "
                "9    9    25    T "
                "10    A    26    U "
                "11    B    27    V "
                "12    C    28    W "
                "13    D    29    X "
                "14    E    30    Y "
                "15    F"
            ).split()
        )
    }

    phone_number = PhoneNumberField(
        allow_blank=True,
        help_text="Employee phone number normalized (start with zero, without country code)",
    )

    def validate_social_security_number(self, value):
        """
        For more info about the checksum validation, see "Miten henkilötunnukset tarkistusmerkki lasketaan?" in
        https://dvv.fi/henkilotunnus
        """
        if value == "":
            return value

        m = re.match(self.SSN_REGEX, value)
        if not m:
            raise serializers.ValidationError(_("Social security number invalid"))

        expect_checksum = EmployeeSerializer.SSN_CHEKSUM[
            int((m.group(1) + m.group(2)).lstrip("0")) % 31
        ].lower()
        if expect_checksum != m.group(3).lower():
            raise serializers.ValidationError(
                _("Social security number checksum invalid")
            )

        return value

    class Meta:
        model = Employee
        fields = [
            "id",
            "first_name",
            "last_name",
            "social_security_number",
            "phone_number",
            "email",
            "employee_language",
            "job_title",
            "monthly_pay",
            "vacation_money",
            "other_expenses",
            "working_hours",
            "collective_bargaining_agreement",
            "is_living_in_helsinki",
            "commission_amount",
            "commission_description",
            "created_at",
        ]
        read_only_fields = [
            "ordering",
        ]


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

    employee = EmployeeSerializer()

    company = CompanySerializer(read_only=True)

    attachments = AttachmentSerializer(
        read_only=True,
        many=True,
        help_text="Attachments of the application (read-only)",
    )

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
            "application_number",
            "employee",
            "company",
            "company_name",
            "company_form",
            "organization_type",
            "submitted_at",
            "bases",
            "available_bases",
            "attachment_requirements",
            "available_benefit_types",
            "official_company_street_address",
            "official_company_city",
            "official_company_postcode",
            "use_alternative_address",
            "alternative_company_street_address",
            "alternative_company_city",
            "alternative_company_postcode",
            "company_bank_account_number",
            "company_contact_person_first_name",
            "company_contact_person_last_name",
            "company_contact_person_phone_number",
            "company_contact_person_email",
            "association_has_business_activities",
            "applicant_language",
            "co_operation_negotiations",
            "co_operation_negotiations_description",
            "pay_subsidy_granted",
            "pay_subsidy_percent",
            "additional_pay_subsidy_percent",
            "apprenticeship_program",
            "archived",
            "benefit_type",
            "start_date",
            "end_date",
            "de_minimis_aid",
            "de_minimis_aid_set",
            "create_application_for_company",
            "last_modified_at",
            "attachments",
        ]
        read_only_fields = [
            "submitted_at",
            "available_bases",
            "attachment_requirements",
            "company_name",
            "company_form",
            "official_company_street_address",
            "official_company_city",
            "official_company_postcode",
            "available_benefit_types",
            "last_modified_at",
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
            "company_contact_person_first_name": {
                "help_text": "First name of the contact person",
            },
            "company_contact_person_last_name": {
                "help_text": "Last name of the contact person",
            },
            "company_contact_person_phone_number": {
                "help_text": "Phone number of the contact person, must a Finnish phone number",
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
            "pay_subsidy_granted": {
                "help_text": "Is pay subsidy granted for the employment?",
            },
            "pay_subsidy_percent": {
                "help_text": "Percentage of the pay subsidy granted",
            },
            "additional_pay_subsidy_percent": {
                "help_text": "Percentage of the pay subsidy granted (If there is another pay subsidy grant)",
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

    submitted_at = serializers.SerializerMethodField("get_submitted_at")

    last_modified_at = serializers.SerializerMethodField(
        "get_last_modified_at",
        help_text="Last modified timestamp. Only handlers see the timestamp of non-draft applications.",
    )

    organization_type = serializers.SerializerMethodField(
        "get_organization_type",
        help_text="The general type of the applicant organization",
    )

    available_bases = serializers.SerializerMethodField(
        "get_available_bases", help_text="List of available application basis slugs"
    )

    attachment_requirements = serializers.SerializerMethodField(
        "get_attachment_requirements", help_text="get the attachment requirements"
    )

    available_benefit_types = serializers.SerializerMethodField(
        "get_available_benefit_types",
        help_text="Available benefit types depend on organization type of the applicant",
    )

    company_contact_person_phone_number = PhoneNumberField(
        allow_blank=True,
        help_text="Company contact person phone number normalized (start with zero, without country code)",
    )

    def get_submitted_at(self, obj):
        if (
            log_entry := obj.log_entries.filter(to_status=ApplicationStatus.RECEIVED)
            .order_by("-created_at")
            .first()
        ):
            return log_entry.created_at
        else:
            return None

    def get_last_modified_at(self, obj):
        if not self.logged_in_user_is_admin() and obj.status != ApplicationStatus.DRAFT:
            return None
        return obj.modified_at

    @extend_schema_field(serializers.ChoiceField(choices=OrganizationType.choices))
    def get_organization_type(self, obj):
        return OrganizationType.resolve_organization_type(obj.company.company_form)

    @extend_schema_field(ApplicationBasisSerializer(many=True))
    def get_available_bases(self, obj):
        return [
            basis.identifier
            for basis in ApplicationBasis.objects.filter(is_active=True)
        ]

    def _get_pay_subsidy_attachment_requirements(self, application):
        req = []
        if application.pay_subsidy_percent:
            req.append(
                (AttachmentType.PAY_SUBSIDY_DECISION, AttachmentRequirement.REQUIRED)
            )
        if application.additional_pay_subsidy_percent:
            req.append(
                (AttachmentType.PAY_SUBSIDY_DECISION, AttachmentRequirement.REQUIRED)
            )
        return req

    def get_attachment_requirements(self, obj):
        if obj.apprenticeship_program:
            return [
                (AttachmentType.EMPLOYMENT_CONTRACT, AttachmentRequirement.REQUIRED),
                (AttachmentType.EDUCATION_CONTRACT, AttachmentRequirement.REQUIRED),
                (
                    AttachmentType.HELSINKI_BENEFIT_VOUCHER,
                    AttachmentRequirement.OPTIONAL,
                ),
            ] + self._get_pay_subsidy_attachment_requirements(obj)
        elif obj.benefit_type in [
            BenefitType.EMPLOYMENT_BENEFIT,
            BenefitType.SALARY_BENEFIT,
        ]:
            return [
                (AttachmentType.EMPLOYMENT_CONTRACT, AttachmentRequirement.REQUIRED),
                (
                    AttachmentType.HELSINKI_BENEFIT_VOUCHER,
                    AttachmentRequirement.OPTIONAL,
                ),
            ] + self._get_pay_subsidy_attachment_requirements(obj)
        elif obj.benefit_type == BenefitType.COMMISSION_BENEFIT:
            return [
                (AttachmentType.COMMISSION_CONTRACT, AttachmentRequirement.REQUIRED),
                (
                    AttachmentType.HELSINKI_BENEFIT_VOUCHER,
                    AttachmentRequirement.OPTIONAL,
                ),
            ]
        elif not obj.benefit_type:
            # applicant has not selected the value yet
            return []
        else:
            raise BenefitAPIException("This should be unreachable")

    def _validate_de_minimis_aid_set(
        self,
        company,
        de_minimis_aid,
        de_minimis_aid_set,
        association_has_business_activities,
    ):
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
            and not association_has_business_activities
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

    def _validate_date_range(self, start_date, end_date, benefit_type):
        # keeping all start/end date validation together
        if start_date and start_date < date(date.today().year, 1, 1):
            raise serializers.ValidationError(
                {"start_date": _("start_date must be within the current year")}
            )
        if end_date:
            if end_date < date(date.today().year, 1, 1):
                raise serializers.ValidationError(
                    {"end_date": _("end_date must be within the current year")}
                )
            if start_date:
                if end_date < start_date:
                    raise serializers.ValidationError(
                        {
                            "end_date": _(
                                "application end_date can not be less than start_date"
                            )
                        }
                    )
                if (
                    benefit_type != BenefitType.COMMISSION_BENEFIT
                    and start_date + relativedelta(months=1) - relativedelta(days=1)
                    > end_date
                ):
                    # A commission can have very short duration and doesn't have the 1 month minimum period as the
                    # employment and salary based benefits.
                    # These two option have identical duration periods which need to be between 1-12 months.
                    # (note: we'll allow full month ranges, like 2021-02-01 - 2021-02-28
                    raise serializers.ValidationError(
                        {"end_date": _("minimum duration of the benefit is one month")}
                    )
                if start_date + relativedelta(months=12) <= end_date:
                    raise serializers.ValidationError(
                        {"end_date": _("maximum duration of the benefit is 12 months")}
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

    def _validate_pay_subsidy(
        self, pay_subsidy_granted, pay_subsidy_percent, additional_pay_subsidy_percent
    ):
        if pay_subsidy_granted and pay_subsidy_percent is None:
            raise serializers.ValidationError(
                {"pay_subsidy_percent": _("Pay subsidy percent required")}
            )
        if not pay_subsidy_granted:
            for key in ["pay_subsidy_percent", "additional_pay_subsidy_percent"]:
                if locals()[key] is not None:
                    raise serializers.ValidationError(
                        {key: _(f"This application can not have {key}")}
                    )
        if pay_subsidy_percent is None and additional_pay_subsidy_percent is not None:
            raise serializers.ValidationError(
                {
                    "additional_pay_subsidy_percent": _(
                        "This application can not have additional_pay_subsidy_percent"
                    )
                }
            )

    # Fields that may be null/blank while the application is draft, but
    # must be filled before submitting the application for processing
    REQUIRED_FIELDS_FOR_SUBMITTED_APPLICATIONS = [
        "company_bank_account_number",
        "company_contact_person_phone_number",
        "company_contact_person_email",
        "company_contact_person_first_name",
        "company_contact_person_last_name",
        "co_operation_negotiations",
        "pay_subsidy_granted",
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
                obj.company,
                obj.association_has_business_activities,
                obj.apprenticeship_program,
            )
        ]

    def _validate_benefit_type(
        self,
        company,
        benefit_type,
        association_has_business_activities,
        apprenticeship_program,
    ):
        if benefit_type == "":
            return
        if benefit_type not in ApplicationSerializer._get_available_benefit_types(
            company, association_has_business_activities, apprenticeship_program
        ):
            raise serializers.ValidationError(
                {"benefit_type": _("This benefit type can not be selected")}
            )

    @staticmethod
    def _get_available_benefit_types(
        company, association_has_business_activities, apprenticeship_program
    ):
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
            if apprenticeship_program:
                return [
                    BenefitType.SALARY_BENEFIT,
                    BenefitType.EMPLOYMENT_BENEFIT,
                ]
            else:
                return [
                    BenefitType.SALARY_BENEFIT,
                    BenefitType.COMMISSION_BENEFIT,
                    BenefitType.EMPLOYMENT_BENEFIT,
                ]

    def validate(self, data):
        """ """
        company = self.get_company(data)
        self._validate_date_range(
            data.get("start_date"), data.get("end_date"), data.get("benefit_type")
        )
        self._validate_co_operation_negotiations(
            data.get("co_operation_negotiations"),
            data.get("co_operation_negotiations_description"),
        )
        self._validate_pay_subsidy(
            data.get("pay_subsidy_granted"),
            data.get("pay_subsidy_percent"),
            data.get("additional_pay_subsidy_percent"),
        )
        self._validate_de_minimis_aid_set(
            company,
            data.get("de_minimis_aid"),
            data.get("de_minimis_aid_set"),
            data.get("association_has_business_activities"),
        )
        self._validate_association_has_business_activities(
            company, data.get("association_has_business_activities")
        )
        self._validate_benefit_type(
            company,
            data.get("benefit_type", ""),
            data.get("association_has_business_activities"),
            data.get("apprenticeship_program"),
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
        employee_data = validated_data.pop("employee", None)
        application = super().update(instance, validated_data)
        if de_minimis_data is not None:
            # if it is a patch request that didn't have de_minimis_data_set, do nothing
            self._update_de_minimis_aid(application, de_minimis_data)
        if employee_data is not None:
            self._update_or_create_employee(application, employee_data)
        return application

    @transaction.atomic
    def create(self, validated_data):
        de_minimis_data = validated_data.pop("de_minimis_aid_set")
        employee_data = validated_data.pop("employee", None)
        validated_data["company"] = self.get_company_for_new_application(validated_data)
        application = super().create(validated_data)
        self.assign_default_fields_from_company(application, validated_data["company"])
        self._update_de_minimis_aid(application, de_minimis_data)
        self._update_or_create_employee(application, employee_data)
        return application

    def _update_or_create_employee(self, application, employee_data):
        employee, created = Employee.objects.update_or_create(
            application=application, defaults=employee_data
        )
        return employee

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
