import pytest

from applications.enums import AhjoRequestType
from applications.services.ahjo.request_handler import AhjoRequestHandler


@pytest.mark.parametrize(
    "request_type",
    [
        (AhjoRequestType.GET_DECISION_MAKER),
        (AhjoRequestType.GET_SIGNER),
    ],
)
def test_init_sets_token_and_request_type(request_type, non_expired_token):
    """
    Test that the constructor correctly sets token and request type
    """
    request_handler = AhjoRequestHandler(non_expired_token, request_type)

    assert request_handler.ahjo_token == non_expired_token
    assert request_handler.ahjo_request_type == request_type
