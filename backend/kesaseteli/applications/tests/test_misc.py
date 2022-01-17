import pytest

from applications.enums import get_supported_languages


@pytest.mark.django_db
@pytest.mark.parametrize(
    "youth_url,url_function_name,language,expected_url",
    [
        (youth_url, url_function_name, language, f"{youth_url}/{language}/{page_name}")
        for page_name, url_function_name in [
            ("activated", "activated_page_url"),
            ("already_activated", "already_activated_page_url"),
            ("expired", "expired_page_url"),
        ]
        for language in get_supported_languages()
        for youth_url in ["https://test.com:1234", "https://example.org"]
    ],
)
def test_youth_application_page_url_function(
    settings,
    youth_application,
    youth_url,
    url_function_name,
    language,
    expected_url,
):
    settings.YOUTH_URL = youth_url
    assert hasattr(youth_application, url_function_name)
    assert callable(getattr(youth_application, url_function_name))

    youth_application.language = language
    youth_application.save(update_fields=["language"])
    youth_application.refresh_from_db()
    url = getattr(youth_application, url_function_name)()
    assert url == expected_url
