from rest_framework import serializers

from applications.exporters.excel_exporter import resolve_target_group_and_status
from applications.models import EmployerSummerVoucher


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

    payee_name = serializers.CharField(source="application.payee_name", read_only=True)
    payee_address = serializers.CharField(
        source="application.payee_address", read_only=True
    )
    bank_swift_bic_code = serializers.CharField(
        source="application.bank_swift_bic_code", read_only=True
    )
    bank_name = serializers.CharField(source="application.bank_name", read_only=True)
    bank_address = serializers.CharField(
        source="application.bank_address", read_only=True
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

    class Meta:
        model = EmployerSummerVoucher
        fields = [
            "id",
            "submitted_at",
            "language",
            "summer_voucher_serial_number",
            "target_group",
            "employee_name",
            "employee_ssn",
            "company_form",
            "company_name",
            "company_business_id",
            "company_street_address",
            "company_postcode",
            "company_city",
            "is_vtj_data_restricted",
            "payee_name",
            "payee_address",
            "bank_swift_bic_code",
            "bank_name",
            "bank_address",
            "bank_account_number",
            "value_in_euros",
            "target_group_calculation_status",
        ]
        read_only_fields = fields


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
            "is_vtj_data_restricted",
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
