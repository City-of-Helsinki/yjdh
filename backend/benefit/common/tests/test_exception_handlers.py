from suomifi_on_behalf import CompanyResolutionError

from common.exception_handlers import (
    COMPANY_RESOLUTION_ERROR_MESSAGE,
    benefit_exception_handler,
)


def test_company_resolution_error_maps_to_controlled_404():
    response = benefit_exception_handler(
        CompanyResolutionError("upstream down"), context={}
    )

    assert response is not None
    assert response.status_code == 404
    assert response.data == COMPANY_RESOLUTION_ERROR_MESSAGE


def test_unhandled_exception_is_not_swallowed():
    # Exceptions the default handler doesn't recognise must keep returning None so the
    # framework still turns them into a 500 rather than being silently masked.
    assert benefit_exception_handler(ValueError("boom"), context={}) is None
