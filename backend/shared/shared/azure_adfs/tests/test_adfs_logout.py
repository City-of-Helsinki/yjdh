from unittest import mock

import pytest
from django.test import override_settings
from django.urls import reverse

ADFS_END_SESSION_ENDPOINT = (
    "https://login.microsoftonline.com/common/oauth2/v2.0/logout"
)


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
    ADFS_LOGIN_REDIRECT_URL="http://example.com/adfs-default",
    CORS_ALLOWED_ORIGINS=["https://redirect-to-me.hel.ninja"],
)
def test_adfs_logout_deep_link(
    client,
    requests_mock,
    user,
):
    """
    Test that the custom logout view correctly appends the provided `next`
    parameter to the ADFS post_logout_redirect_uri.
    """
    deep_link = "https://redirect-to-me.hel.ninja/login"

    with mock.patch(
        "shared.azure_adfs.views.is_safe_redirect_url", return_value=True
    ):
        with mock.patch("django_auth_adfs.views.provider_config") as mock_provider:
            mock_provider.build_end_session_endpoint.return_value = (
                ADFS_END_SESSION_ENDPOINT
            )

            logout_url = f"{reverse('django_auth_adfs:logout')}?next={deep_link}"
            client.force_login(user)
            response = client.get(logout_url)

    assert response.status_code == 302
    assert (
        response.url
        == f"{ADFS_END_SESSION_ENDPOINT}?post_logout_redirect_uri=https%3A%2F%2Fredirect-to-me.hel.ninja%2Flogin"
    )
    assert "_auth_user_id" not in client.session
