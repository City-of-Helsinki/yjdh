from unittest.mock import patch

import pytest
from django.http import Http404
from requests.exceptions import HTTPError
from suomifi_on_behalf import CompanyResolutionError

from users.utils import get_company_from_request


@pytest.mark.django_db
@pytest.mark.parametrize("upstream_error", [HTTPError("down"), Http404("not found")])
def test_get_company_from_request_maps_upstream_failure_to_resolution_error(
    settings, upstream_error
):
    # No company exists locally for this business id, so the DB lookup misses and the
    # upstream call is attempted. Both HTTPError (outage) and Http404 (not found) must
    # be normalised to a single CompanyResolutionError.
    settings.NEXT_PUBLIC_MOCK_FLAG = False
    with (
        patch("users.utils.get_business_id_from_request", return_value="1234567-8"),
        patch(
            "users.utils.get_or_create_organisation_with_business_id",
            side_effect=upstream_error,
        ),
    ):
        with pytest.raises(CompanyResolutionError):
            get_company_from_request(request=object())


@pytest.mark.django_db
def test_get_company_from_request_returns_none_without_business_id(settings):
    settings.NEXT_PUBLIC_MOCK_FLAG = False
    with patch("users.utils.get_business_id_from_request", return_value=None):
        assert get_company_from_request(request=object()) is None
