from django.utils.translation import gettext_lazy as _
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler
from suomifi_on_behalf import CompanyResolutionError

# Shared message for the case where a company cannot be resolved because the upstream
# YTJ/YRTTI APIs are unavailable and no company is stored locally as a fallback.
COMPANY_RESOLUTION_ERROR_MESSAGE = _(
    "YTJ API is under heavy load or no company found with the given business id"
)


def benefit_exception_handler(exc, context):
    """DRF exception handler that maps company-resolution failures to a controlled 404.

    ``CompanyResolutionError`` is a plain ``Exception`` (not an ``APIException``), so
    without this handler it would surface as an uncaught 500. Mapping it here gives a
    single, consistent controlled response for every caller that resolves a company -
    permission checks, serializers and views alike - instead of each having to catch it.
    """
    response = exception_handler(exc, context)
    if response is None and isinstance(exc, CompanyResolutionError):
        return Response(
            COMPANY_RESOLUTION_ERROR_MESSAGE,
            status=status.HTTP_404_NOT_FOUND,
        )
    return response
