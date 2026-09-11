from django.conf import settings
from django.http import Http404
from requests.exceptions import RequestException
from suomifi_on_behalf import CompanyResolutionError, get_organization_roles

from companies.models import Company
from companies.services import get_or_create_organisation_with_business_id


def get_request_user_from_context(serializer):
    request = serializer.context.get("request")
    if request:
        return request.user
    return None


def get_business_id_from_request(request):
    if request and request.user and request.user.is_authenticated:
        organization_roles = get_organization_roles(request)
        return organization_roles.get("identifier")
    return None


def get_company_from_request(request):
    if settings.NEXT_PUBLIC_MOCK_FLAG:
        return Company.objects.all().order_by("name").first()

    if business_id := get_business_id_from_request(request):
        try:
            return Company.objects.get(
                business_id=business_id
            )  # unique constraint ensures at most one is returned
        except Company.DoesNotExist:
            # In case we cannot find the Company in DB, try to query it from 3rd party
            # source
            # This should cover the case when first applicant of company log in because
            # their company hasn't been created yet.
            # Map upstream failures (YTJ/YRTTI unavailable, or no company found) to a
            # single CompanyResolutionError so every caller gets a consistent,
            # controlled response via the global exception handler instead of an
            # uncaught HTTPError/Http404 surfacing as a 500.
            try:
                return get_or_create_organisation_with_business_id(business_id)
            except (RequestException, Http404) as exc:
                raise CompanyResolutionError(str(exc)) from exc
    else:
        return None
