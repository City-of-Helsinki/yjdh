from django.conf import settings
from django.utils import translation

from applications.enums import EmailTemplateType
from common.tests.factories import YouthApplicationFactory, YouthSummerVoucherFactory


class MockContextService:
    @staticmethod
    def get_mock_context(template_type: str, language: str = "fi") -> dict:
        """
        Generate a mock context dictionary for the given template type using Factories.
        """
        with translation.override(language):
            if template_type == EmailTemplateType.ACTIVATION:
                return MockContextService._get_activation_context(language)
            elif template_type == EmailTemplateType.ADDITIONAL_INFO_REQUEST:
                return MockContextService._get_additional_info_context(language)
            elif template_type == EmailTemplateType.PROCESSING:
                return MockContextService._get_processing_context(language)
            elif template_type == EmailTemplateType.YOUTH_SUMMER_VOUCHER:
                return MockContextService._get_youth_summer_voucher_context(language)
        return {}

    @staticmethod
    def _get_activation_context(language):
        YouthApplicationFactory.build(language=language)
        # Mocking the activation link since we don't have a request easily available
        activation_link = f"{settings.YOUTH_URL}/{language}/activate?id=mock-uuid"
        return {"activation_link": activation_link}

    @staticmethod
    def _get_additional_info_context(language):
        # Same context variable as activation
        return MockContextService._get_activation_context(language)

    @staticmethod
    def _get_processing_context(language):
        app = YouthApplicationFactory.build(language=language)
        processing_link = f"https://handler.hel.fi/process/{app.pk}"
        return {
            "first_name": app.first_name,
            "last_name": app.last_name,
            "school": app.school,
            "postcode": app.postcode,
            "phone_number": app.phone_number,
            "email": app.email,
            "processing_link": processing_link,
        }

    @staticmethod
    def _get_youth_summer_voucher_context(language):
        # We need a full voucher for this
        voucher = YouthSummerVoucherFactory.build(
            youth_application=YouthApplicationFactory.build(language=language)
        )
        # Ensure year is set (factories might default to current time)
        # We need to manually invoke properties if they are not fields

        return {
            "first_name": voucher.youth_application.first_name,
            "last_name": voucher.youth_application.last_name,
            "summer_voucher_serial_number": voucher.summer_voucher_serial_number,
            "postcode": voucher.youth_application.postcode,
            "school": voucher.youth_application.school,
            "phone_number": voucher.youth_application.phone_number,
            "email": voucher.youth_application.email,
            "year": voucher.year,
            "voucher_value_with_euro_sign": voucher.voucher_value_with_euro_sign,
            "summer_job_period_localized_string": (
                voucher.summer_job_period_localized_string
            ),
            "employer_summer_voucher_application_end_date_localized_string": (
                voucher.employer_summer_voucher_application_end_date_localized_string
            ),
            "min_work_hours": voucher.min_work_hours,
            "min_work_compensation_with_euro_sign": (
                voucher.min_work_compensation_with_euro_sign
            ),
        }
