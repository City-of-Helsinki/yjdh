from django.utils.translation import gettext_lazy as _
from rest_framework.exceptions import APIException


class VTJServiceUnavailableError(APIException):
    """Raised when the VTJ (Population Information System) REST API is unreachable."""

    status_code = 503
    default_detail = _(
        "Population Information System is temporarily unavailable. "
        "Please try again later."
    )
    default_code = "vtj_service_unavailable"
