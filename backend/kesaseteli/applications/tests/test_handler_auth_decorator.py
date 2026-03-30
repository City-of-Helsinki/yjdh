import pytest
from django.test import override_settings
from django.utils.translation import gettext as _
from rest_framework import status
from rest_framework.exceptions import NotAuthenticated, PermissionDenied
from rest_framework.reverse import reverse

from common.urls import handler_403_url
from shared.common.tests.factories import UserFactory


@pytest.mark.django_db
class TestHandlerAuthDecorator:
    """
    Test the behavior of the enforce_handler_view_adfs_login decorator.
    """

    @override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
    def test_unauthenticated_api_request_returns_401(self, client, youth_application):
        """
        Test that an unauthenticated API request (Accept: application/json)
        returns 401 Unauthorized.
        """
        url = reverse("v1:youthapplication-detail", kwargs={"pk": youth_application.pk})
        response = client.get(url, headers={"Accept": "application/json"})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.json() == {
            "detail": _("Authentication credentials were not provided."),
            "code": NotAuthenticated.default_code,
        }

    @override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
    def test_unauthenticated_browser_request_redirects_to_login(
        self, client, youth_application
    ):
        """
        Test that an unauthenticated browser request (No Accept: application/json)
        redirects to the ADFS login page.
        """
        url = reverse("v1:youthapplication-detail", kwargs={"pk": youth_application.pk})
        response = client.get(url)  # Default Accept header is NOT application/json
        assert response.status_code == status.HTTP_302_FOUND
        assert response.url.startswith(reverse("django_auth_adfs:login"))

    @override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
    def test_unauthorized_api_request_returns_403(self, client, youth_application):
        """
        Test that an authenticated but unauthorized API request
        (Accept: application/json) returns 403 Forbidden.
        """
        user = UserFactory()  # Regular user, not a handler
        client.force_login(user)

        url = reverse("v1:youthapplication-detail", kwargs={"pk": youth_application.pk})
        response = client.get(url, headers={"Accept": "application/json"})
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert response.json() == {
            "detail": _("You do not have permission to view this page."),
            "code": PermissionDenied.default_code,
        }

    @override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
    def test_unauthorized_browser_request_redirects_to_403_page(
        self, client, youth_application
    ):
        """
        Test that an authenticated but unauthorized browser request
        (No Accept: application/json) redirects to the handler 403 page.
        """
        user = UserFactory()  # Regular user, not a handler
        client.force_login(user)

        url = reverse("v1:youthapplication-detail", kwargs={"pk": youth_application.pk})
        response = client.get(url)  # Default Accept header is NOT application/json
        assert response.status_code == status.HTTP_302_FOUND
        assert response.url == handler_403_url()

    @override_settings(NEXT_PUBLIC_MOCK_FLAG=False, NEXT_PUBLIC_DISABLE_VTJ=True)
    def test_authorized_request_allowed(self, client, youth_application):
        """
        Test that an authorized handler request is allowed (returns 200 OK).
        """
        handler = UserFactory(is_staff=True)  # Simple staff user can be a handler
        client.force_login(handler)

        url = reverse("v1:youthapplication-detail", kwargs={"pk": youth_application.pk})
        response = client.get(url, headers={"Accept": "application/json"})
        assert response.status_code == status.HTTP_200_OK
