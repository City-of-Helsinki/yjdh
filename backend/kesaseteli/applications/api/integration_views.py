import logging
import secrets

from django.conf import settings
from rest_framework.permissions import BasePermission

from applications.api.authentications import TALPA_ROBOT_AUTH_NAME
from applications.enums import EmployerApplicationStatus
from kesaseteli.constants import MIN_API_KEY_LENGTH

logger = logging.getLogger(__name__)

# Only vouchers on SUBMITTED applications may be marked as invoiced by Talpa.
# ERROR_IN_PAYMENT is intentionally excluded: Talpa itself set that status,
# so the voucher should not cycle back through invoicing.
TALPA_INVOICEABLE_STATUSES = [EmployerApplicationStatus.SUBMITTED]


class ApiKeyPermission(BasePermission):
    """
    Verifies that the request carries the correct API key for the
    configured integration endpoint.

    key_setting_name: name of the Django settings attribute holding the
    expected key (e.g. "TALPA_WEBHOOK_API_KEY").
    """

    key_setting_name: str  # Set on each concrete subclass

    def has_permission(self, request, view):
        expected = getattr(settings, self.key_setting_name, "")
        if not expected:
            logger.warning(f"{self.key_setting_name} is not configured.")
            return False
        if len(expected) < MIN_API_KEY_LENGTH:
            logger.warning(
                f"{self.key_setting_name} must be at least "
                f"{MIN_API_KEY_LENGTH} characters long."
            )
            return False
        provided = request.headers.get("X-Api-Key", "")
        try:
            expected_bytes = expected.encode("utf-8")
            provided_bytes = provided.encode("utf-8")
        except UnicodeEncodeError:
            return False
        return secrets.compare_digest(expected_bytes, provided_bytes)


class TalpaApiKeyPermission(ApiKeyPermission):
    key_setting_name = "TALPA_WEBHOOK_API_KEY"


class TalpaBasicAuthPermission(BasePermission):
    """
    Grants access if the request was authenticated via TalpaRobotBasicAuthentication.
    TALPA_ROBOT_AUTH_CREDENTIAL must be non-empty for this to work.
    This is a fallback for Talpa systems that cannot send an X-Api-Key header.
    """

    def has_permission(self, request, view):
        return request.auth == TALPA_ROBOT_AUTH_NAME


class ReportingApiKeyPermission(ApiKeyPermission):
    key_setting_name = "REPORTING_EXPORT_API_KEY"


class YouthApiKeyPermission(ApiKeyPermission):
    key_setting_name = "YOUTH_EXPORT_API_KEY"


class AnonymousReportingApiKeyPermission(ApiKeyPermission):
    key_setting_name = "ANONYMOUS_REPORTING_EXPORT_API_KEY"


class AnonymousYouthApiKeyPermission(ApiKeyPermission):
    key_setting_name = "ANONYMOUS_YOUTH_EXPORT_API_KEY"
