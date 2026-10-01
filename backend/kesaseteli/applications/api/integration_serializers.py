from drf_spectacular.utils import extend_schema_serializer, OpenApiExample
from rest_framework import serializers

from applications.exporters.excel_exporter import resolve_target_group_and_status
from applications.models import EmployerSummerVoucher

FOREIGN_BANK_ACCOUNT_HELP_TEXT = "Filled only for foreign bank accounts."


class _AnonymousVoucherBaseSerializer(serializers.ModelSerializer):
    """
    Base serializer containing shared anonymous fields for JSON exports.
    """

    language = serializers.CharField(source="application.language", read_only=True)
    company_form = serializers.CharField(
        source="application.company.company_form", read_only=True
    )
    company_name = serializers.CharField(
        source="application.company.name", read_only=True
    )
    company_street_address = serializers.CharField(
        source="application.company.street_address", read_only=True
    )
    company_postcode = serializers.CharField(
        source="application.company.postcode", read_only=True
    )
    company_city = serializers.CharField(
        source="application.company.city", read_only=True
    )

    submitted_at = serializers.DateTimeField(
        source="application.submitted_at", read_only=True
    )

    target_group_calculation_status = serializers.SerializerMethodField()

    def get_target_group_calculation_status(self, obj: EmployerSummerVoucher) -> str:
        youth_app = (
            obj.youth_summer_voucher.youth_application
            if obj.youth_summer_voucher
            else None
        )
        _, status_val = resolve_target_group_and_status(youth_app)
        return status_val


class _BaseVoucherExportSerializer(_AnonymousVoucherBaseSerializer):
    """
    Base serializer containing shared sensitive fields (like banking) for JSON exports.
    """

    payee_name = serializers.CharField(
        source="application.payee_name",
        read_only=True,
        allow_blank=True,
        required=False,
        help_text=FOREIGN_BANK_ACCOUNT_HELP_TEXT,
    )
    payee_address = serializers.CharField(
        source="application.payee_address",
        read_only=True,
        allow_blank=True,
        required=False,
        help_text=FOREIGN_BANK_ACCOUNT_HELP_TEXT,
    )
    bank_swift_bic_code = serializers.CharField(
        source="application.bank_swift_bic_code",
        read_only=True,
        allow_blank=True,
        required=False,
        help_text=FOREIGN_BANK_ACCOUNT_HELP_TEXT,
    )
    bank_name = serializers.CharField(
        source="application.bank_name",
        read_only=True,
        allow_blank=True,
        required=False,
        help_text=FOREIGN_BANK_ACCOUNT_HELP_TEXT,
    )
    bank_address = serializers.CharField(
        source="application.bank_address",
        read_only=True,
        allow_blank=True,
        required=False,
        help_text=FOREIGN_BANK_ACCOUNT_HELP_TEXT,
    )


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Primary target group voucher (Finnish bank account)",
            value={
                "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                "submitted_at": "2026-06-15T09:42:00+03:00",
                "language": "fi",
                "summer_voucher_serial_number": "cn9-d2y-wp4-x41",
                "target_group": "yhdeksäsluokkalainen",
                "company_form": "OY",
                "company_name": "Helsingin Rakennuspalvelut Oy",
                "company_business_id": "1234567-8",
                "company_street_address": "Mannerheimintie 10",
                "company_postcode": "00100",
                "company_city": "Helsinki",
                "payee_name": "",
                "payee_address": "",
                "bank_swift_bic_code": "",
                "bank_name": "",
                "bank_address": "",
                "bank_account_number": "FI21 1234 5600 0007 85",
                "value_in_euros": "350.00",
                "handler_id": "c30f87bd-8d65-4f4f-bfa9-ef331f4a9b6c",
                "handler_name": "Maija Meikäläinen",
                "approver_id": "d41f87bd-8d65-4f4f-bfa9-ef331f4a9b6d",
                "approver_name": "Pekka Virtanen",
                "handled_at": "2026-08-01T11:20:00+03:00",
                "accepted_for_payment_at": "2026-08-05T13:45:00+03:00",
            },
            response_only=True,
        ),
        OpenApiExample(
            "Secondary target group voucher (foreign bank account)",
            value={
                "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
                "submitted_at": "2026-06-20T14:10:00+03:00",
                "language": "sv",
                "summer_voucher_serial_number": "c8c-dk5-xn3-f25",
                "target_group": "toisen_asteen_opiskelija",
                "company_form": "KY",
                "company_name": "Suutari Korhonen Ky",
                "company_business_id": "9876543-2",
                "company_street_address": "Hämeentie 42",
                "company_postcode": "00500",
                "company_city": "Helsinki",
                "payee_name": "Suutari Korhonen Ky",
                "payee_address": "Hämeentie 42, 00500 Helsinki",
                "bank_swift_bic_code": "HANDSEHH",
                "bank_name": "Svenska Handelsbanken",
                "bank_address": "Kungsträdgårdsgatan 2, 106 70 Stockholm, Sweden",
                "bank_account_number": "SE45 5000 0000 0549 1000 0003",
                "value_in_euros": "350.00",
                "handler_id": "e52f87bd-8d65-4f4f-bfa9-ef331f4a9b6e",
                "handler_name": "Liisa Korhonen",
                "approver_id": "f63f87bd-8d65-4f4f-bfa9-ef331f4a9b6f",
                "approver_name": "Juha Mäkinen",
                "handled_at": "2026-08-10T09:05:00+03:00",
                "accepted_for_payment_at": "2026-08-12T16:30:00+03:00",
            },
            response_only=True,
        ),
    ]
)
class TalpaExportSerializer(_BaseVoucherExportSerializer):
    """
    Serializer for the Talpa JSON export.
    Mirrors the exact fields defined in get_talpa_columns() in excel_exporter.py.
    This JSON export endpoint will eventually replace the Excel exporter
    for the Talpa robot.
    """

    company_business_id = serializers.CharField(
        source="application.company.business_id", read_only=True
    )
    bank_account_number = serializers.CharField(
        source="application.bank_account_number", read_only=True
    )
    handler_id = serializers.SerializerMethodField()
    handler_name = serializers.SerializerMethodField()
    approver_id = serializers.SerializerMethodField()
    approver_name = serializers.SerializerMethodField()
    handled_at = serializers.SerializerMethodField()
    accepted_for_payment_at = serializers.SerializerMethodField()

    class Meta:
        model = EmployerSummerVoucher
        fields = [
            "id",
            "submitted_at",
            "language",
            "summer_voucher_serial_number",
            "target_group",
            "company_form",
            "company_name",
            "company_business_id",
            "company_street_address",
            "company_postcode",
            "company_city",
            "payee_name",
            "payee_address",
            "bank_swift_bic_code",
            "bank_name",
            "bank_address",
            "bank_account_number",
            "value_in_euros",
            "handler_id",
            "handler_name",
            "approver_id",
            "approver_name",
            "handled_at",
            "accepted_for_payment_at",
        ]
        read_only_fields = fields

    def get_handler_id(self, obj: EmployerSummerVoucher) -> str | None:
        handler = getattr(obj.application, "handler", None)
        return handler.username if handler else None

    def get_handler_name(self, obj: EmployerSummerVoucher) -> str | None:
        handler = getattr(obj.application, "handler", None)
        return handler.get_full_name() if handler else None

    def get_approver_id(self, obj: EmployerSummerVoucher) -> str | None:
        approver = getattr(obj.application, "approver", None)
        return approver.username if approver else None

    def get_approver_name(self, obj: EmployerSummerVoucher) -> str | None:
        approver = getattr(obj.application, "approver", None)
        return approver.get_full_name() if approver else None

    def get_handled_at(self, obj: EmployerSummerVoucher):
        return getattr(obj.application, "handled_at", None)

    def get_accepted_for_payment_at(self, obj: EmployerSummerVoucher):
        return getattr(obj.application, "accepted_for_payment_at", None)


class AnonymousReportingExportSerializer(_AnonymousVoucherBaseSerializer):
    """
    Serializer for the Anonymous Reporting JSON export.
    Removes all personally identifiable information.
    """

    company_industry = serializers.CharField(
        source="application.company.industry", read_only=True
    )

    class Meta:
        model = EmployerSummerVoucher
        fields = [
            "id",
            "submitted_at",
            "language",
            "target_group",
            "employee_school",
            "employee_postcode",
            "employee_home_city",
            "company_form",
            "company_name",
            "company_street_address",
            "company_postcode",
            "company_city",
            "company_industry",
            "employment_postcode",
            "employment_start_date",
            "employment_end_date",
            "employment_work_hours",
            "employment_salary_paid",
            "employment_description",
            "hired_without_voucher_assessment",
            "target_group_calculation_status",
            "job_type",
        ]
        read_only_fields = fields


class ReportingExportSerializer(
    AnonymousReportingExportSerializer, _BaseVoucherExportSerializer
):
    """
    Serializer for the Reporting JSON export.
    Mirrors the exact fields defined in get_reporting_columns() in excel_exporter.py.
    """

    contact_person_email = serializers.CharField(
        source="application.contact_person_email", read_only=True
    )
    contact_person_phone_number = serializers.CharField(
        source="application.contact_person_phone_number", read_only=True
    )

    class Meta:
        model = EmployerSummerVoucher
        fields = AnonymousReportingExportSerializer.Meta.fields + [
            "summer_voucher_serial_number",
            "employee_name",
            "employee_ssn",
            "employee_phone_number",
            "contact_person_email",
            "contact_person_phone_number",
            "payee_name",
            "payee_address",
            "bank_swift_bic_code",
            "bank_name",
            "bank_address",
        ]
        read_only_fields = fields
