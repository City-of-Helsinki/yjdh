import base64
import re
from unittest import mock

import pytest
from django.conf import settings
from django.test import override_settings
from django.urls import reverse

from shared.azure_adfs.auth import HelsinkiAdfsAuthCodeBackend, provider_config
from shared.common.tests import get_default_test_host


@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
)
def test_get_member_objects(requests_mock):
    """
    Docs: https://docs.microsoft.com/en-us/graph/api/directoryobject-getmemberobjects?view=graph-rest-1.0&tabs=http
    """
    auth_backend = HelsinkiAdfsAuthCodeBackend()

    member_objects_response = {
        "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#Collection(Edm.String)",
        "value": [
            "fee2c45b-915a-4a64-b130-f4eb9e75525e",
            "4fe90ae7-065a-478b-9400-e0a0e1cbd540",
            "c9ee2d50-9e8a-4352-b97c-4c2c99557c22",
            "e0c3beaf-eeb4-43d8-abc5-94f037a65697",
        ],
    }

    matcher = re.compile("https://graph.microsoft.com/")
    requests_mock.post(matcher, json=member_objects_response)

    groups = auth_backend.get_member_objects_from_graph_api("test", "test")

    user_groups = ["adfs-" + group for group in member_objects_response["value"]]
    assert sorted(groups) == sorted(user_groups)


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
)
def test_update_user_groups_from_graph_api(requests_mock, user):
    """
    Docs: https://docs.microsoft.com/en-us/graph/api/directoryobject-getmemberobjects?view=graph-rest-1.0&tabs=http
    """
    auth_backend = HelsinkiAdfsAuthCodeBackend()

    member_objects_response = {
        "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#Collection(Edm.String)",
        "value": [
            "fee2c45b-915a-4a64-b130-f4eb9e75525e",
            "4fe90ae7-065a-478b-9400-e0a0e1cbd540",
            "c9ee2d50-9e8a-4352-b97c-4c2c99557c22",
            "e0c3beaf-eeb4-43d8-abc5-94f037a65697",
        ],
    }

    matcher = re.compile("https://graph.microsoft.com/")
    requests_mock.post(matcher, json=member_objects_response)

    auth_backend.update_user_groups_from_graph_api(user, "test", "test")
    user.refresh_from_db()

    user_groups = ["adfs-" + group for group in member_objects_response["value"]]
    assert sorted(list(user.groups.all().values_list("name", flat=True))) == sorted(
        user_groups
    )


@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
)
def test_get_graph_api_access_token(requests_mock):
    """
    Docs: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-on-behalf-of-flow
    """
    auth_backend = HelsinkiAdfsAuthCodeBackend()

    token_endpoint_response = {
        "token_type": "Bearer",
        "scope": "https://graph.microsoft.com/user.read",
        "expires_in": 3269,
        "ext_expires_in": 0,
        "access_token": "eyJ0eXAiOiJKV1QiLCJub25jZSI6IkFRQUJBQUFBQUFCbmZpRy1tQTZOVGFlN0NkV1c",
        "refresh_token": "OAQABAAAAAABnfiG-mA6NTae7CdWW7QfdAALzDWjw6qSn4GUDfxWzJDZ6lk9qRw4An",
    }

    matcher = re.compile("https://login.microsoftonline.com/")
    requests_mock.post(matcher, json=token_endpoint_response)

    with mock.patch.object(
        provider_config,
        "token_endpoint",
        "https://login.microsoftonline.com/v1.0/oauth2/token",
    ):
        access_token = auth_backend.get_graph_api_access_token("test")

    assert access_token == token_endpoint_response["access_token"]


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
)
def test_authenticate(user):
    auth_backend = HelsinkiAdfsAuthCodeBackend()

    with mock.patch("shared.azure_adfs.auth.provider_config"):
        with mock.patch.multiple(
            "shared.azure_adfs.auth.HelsinkiAdfsAuthCodeBackend",
            exchange_auth_code=mock.MagicMock,
            validate_access_token=mock.MagicMock(return_value={"oid": "test"}),
            process_access_token=mock.MagicMock(return_value=user),
            get_graph_api_access_token=mock.MagicMock,
            update_user_groups_from_graph_api=mock.MagicMock,
        ):
            auth_user = auth_backend.authenticate(authorization_code="test")

    assert auth_user == user


@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False,
)
def test_authenticate_no_authorization_code():
    auth_backend = HelsinkiAdfsAuthCodeBackend()
    with mock.patch("shared.azure_adfs.auth.provider_config"):
        auth_user = auth_backend.authenticate()

    assert auth_user is None


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False, ADFS_LOGIN_REDIRECT_URL="http://example.com"
)
def test_adfs_callback(client, user):
    with mock.patch("shared.azure_adfs.auth.provider_config"):
        with mock.patch.multiple(
            "shared.azure_adfs.auth.HelsinkiAdfsAuthCodeBackend",
            exchange_auth_code=mock.MagicMock,
            validate_access_token=mock.MagicMock(return_value={"oid": "test"}),
            process_access_token=mock.MagicMock(return_value=user),
            get_graph_api_access_token=mock.MagicMock,
            update_user_groups_from_graph_api=mock.MagicMock,
        ):
            callback_url = f"{reverse('callback')}?code=test"
            response = client.get(callback_url)

    assert response.status_code == 302
    assert response.url == settings.ADFS_LOGIN_REDIRECT_URL
    assert "_auth_user_id" in client.session


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False, ADFS_LOGIN_REDIRECT_URL="http://example.com"
)
@pytest.mark.parametrize(
    "original_redirect_url",
    [
        "./test/",
        "https://{host}/v1/test/".format(host=get_default_test_host()),
    ],
)
def test_adfs_callback_original_redirect(client, user, original_redirect_url):
    with mock.patch("shared.azure_adfs.auth.provider_config"):
        with mock.patch.multiple(
            "shared.azure_adfs.auth.HelsinkiAdfsAuthCodeBackend",
            exchange_auth_code=mock.MagicMock,
            validate_access_token=mock.MagicMock(return_value={"oid": "test"}),
            process_access_token=mock.MagicMock(return_value=user),
            get_graph_api_access_token=mock.MagicMock,
            update_user_groups_from_graph_api=mock.MagicMock,
        ):
            session = client.session  # Client.session property generates a new session
            session["USE_ORIGINAL_REDIRECT_URL"] = True
            session.save()
            state = base64.urlsafe_b64encode(original_redirect_url.encode())
            callback_url = reverse("callback")
            # Make sure the session variable is set up correctly
            assert "USE_ORIGINAL_REDIRECT_URL" in client.session
            assert client.session["USE_ORIGINAL_REDIRECT_URL"] is True
            response = client.get(callback_url, {"code": "test", "state": state})

    assert response.status_code == 302
    assert response.url == original_redirect_url
    assert "USE_ORIGINAL_REDIRECT_URL" not in client.session
    assert "_auth_user_id" in client.session


@pytest.mark.django_db
@override_settings(
    NEXT_PUBLIC_MOCK_FLAG=False, ADFS_LOGIN_REDIRECT_URL_FAILURE="http://example.com"
)
def test_adfs_callback_no_code(client):
    callback_url = reverse("callback")
    response = client.get(callback_url)

    assert response.status_code == 302
    assert response.url == settings.ADFS_LOGIN_REDIRECT_URL_FAILURE
    assert "_auth_user_id" not in client.session
