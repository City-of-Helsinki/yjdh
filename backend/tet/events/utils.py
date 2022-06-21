# Common utils used by services and transformations

from django.conf import settings
from django.http import HttpRequest
from requests import RequestException
from rest_framework.exceptions import PermissionDenied

from shared.oidc.utils import get_organization_roles

# TET service uses Linked Events `provider` field to store data that needs to be searchable
# We can then filter events with the `text` criterion to reduce matches
#
# Normally we use the field `custom_data` for this, but this field is not searchable.
# `provider` is a localized object with keys like "fi" or "sv". Here we use them to store
# different data, which can be very counterintuitive. This is why the code always refers
# to the fields by these constants.
PROVIDER_NAME_FIELD = "fi"
PROVIDER_BUSINESS_ID_FIELD = "sv"

# AD users get this as the company name
# while for suomi.fi users the company name is fetched via YTJ
# TODO we need to localize this based on user's locale
CITY_OF_HELSINKI = "Helsingin kaupunki"


def get_business_id(request: HttpRequest):
    if settings.NEXT_PUBLIC_MOCK_FLAG:
        return "123456-7"

    try:
        organization_roles = get_organization_roles(request)
    except RequestException:
        raise PermissionDenied(
            detail="Unable to fetch organization roles from eauthorizations API"
        )

    business_id = organization_roles.get("identifier")

    if not business_id:
        raise PermissionDenied(detail="Empty business id, not able to use the service")

    return business_id


def get_organization_name(request: HttpRequest):
    if request.user.is_staff:
        return CITY_OF_HELSINKI

    if settings.NEXT_PUBLIC_MOCK_FLAG:
        return "Test Company"

    # TODO using the YTJ API will be implemented in TETP-214

    raise PermissionDenied(detail="Fetching company name not implemented")
