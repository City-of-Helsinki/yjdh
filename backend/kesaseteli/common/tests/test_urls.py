import uuid

import pytest

from common.urls import handler_403_url, handler_youth_application_processing_url


@pytest.mark.parametrize(
    "handler_url, expected_result",
    [
        ("https://example.org", "https://example.org/fi/403"),
        ("https://example.com/", "https://example.com/fi/403"),
        ("https://test.org:3200", "https://test.org:3200/fi/403"),
        ("https://test.example.com:80/", "https://test.example.com:80/fi/403"),
    ],
)
def test_handler_403_url(settings, handler_url, expected_result):
    settings.HANDLER_URL = handler_url
    assert handler_403_url() == expected_result


@pytest.mark.parametrize(
    "handler_url, pk, expected_result",
    [
        (
            "https://example.org",
            "5ab8c069-4e64-49e6-9140-d6407b105df2",
            "https://example.org/?id=5ab8c069-4e64-49e6-9140-d6407b105df2",
        ),
        (
            "https://example.org",
            uuid.UUID("5ab8c069-4e64-49e6-9140-d6407b105df2"),
            "https://example.org/?id=5ab8c069-4e64-49e6-9140-d6407b105df2",
        ),
        ("https://example.com/", "1234", "https://example.com/?id=1234"),
        ("https://test.org:3200", 8, "https://test.org:3200/?id=8"),
        ("https://a.b.com:80/", "test_id", "https://a.b.com:80/?id=test_id"),
    ],
)
def test_handler_youth_application_processing_url(
    settings, handler_url, pk, expected_result
):
    settings.HANDLER_URL = handler_url
    assert handler_youth_application_processing_url(pk) == expected_result
