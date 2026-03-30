import pytest
from django.test import RequestFactory

from common.decorators import is_api_request


@pytest.mark.parametrize(
    "accept_header,expected_result",
    [
        ("application/json", True),
        ("application/json, text/plain, */*", True),
        ("application/json; charset=utf-8", True),
        ("text/html, application/xhtml+xml, */*", False),
        ("*/*", False),
        ("", False),
        (None, False),
    ],
)
def test_is_api_request(accept_header, expected_result):
    factory = RequestFactory()
    if accept_header is not None:
        request = factory.get("/", HTTP_ACCEPT=accept_header)
    else:
        request = factory.get("/")
        # Manually remove Accept if it was added by default
        if "HTTP_ACCEPT" in request.META:
            del request.META["HTTP_ACCEPT"]

    assert is_api_request(request) == expected_result
