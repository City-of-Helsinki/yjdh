from unittest.mock import MagicMock, patch

from django.test import override_settings, RequestFactory, TestCase

from kesaseteli.auth_views import (
    KesaseteliADFSLogoutCallbackView,
    KesaseteliADFSLogoutView,
    NEXT_URL_COOKIE_NAME,
)


@override_settings(ROOT_URLCONF="kesaseteli.urls")
class TestKesaseteliADFSLogoutView(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    @patch("kesaseteli.auth_views.OAuth2LogoutView.get")
    def test_get_sets_cookie_with_valid_next_url(self, mock_super_get):
        # Mock super().get() to return a dummy response
        mock_response = MagicMock()
        mock_super_get.return_value = mock_response

        request = self.factory.get("/oauth2/logout/", {"next": "/admin/"})
        view = KesaseteliADFSLogoutView.as_view()

        view(request)

        # Verify super().get() was called
        mock_super_get.assert_called_once()

        # Verify cookie was set on the response object returned by super()
        mock_response.set_cookie.assert_called_once()
        args, kwargs = mock_response.set_cookie.call_args
        self.assertEqual(args[0], NEXT_URL_COOKIE_NAME)
        self.assertEqual(args[1], "/admin/")
        self.assertTrue(kwargs.get("httponly"))

    @patch("kesaseteli.auth_views.OAuth2LogoutView.get")
    def test_get_does_not_set_cookie_without_next_url(self, mock_super_get):
        mock_response = MagicMock()
        mock_super_get.return_value = mock_response

        request = self.factory.get("/oauth2/logout/")
        view = KesaseteliADFSLogoutView.as_view()

        view(request)

        mock_response.set_cookie.assert_not_called()

    @patch("kesaseteli.auth_views.OAuth2LogoutView.get")
    def test_get_does_not_set_cookie_with_unsafe_next_url(self, mock_super_get):
        mock_response = MagicMock()
        mock_super_get.return_value = mock_response

        # Unsafe URL (external domain)
        request = self.factory.get("/oauth2/logout/", {"next": "https://evil.com"})
        view = KesaseteliADFSLogoutView.as_view()

        view(request)

        mock_response.set_cookie.assert_not_called()


class TestKesaseteliADFSLogoutCallbackView(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def test_get_redirects_to_cookie_value_and_deletes_cookie(self):
        request = self.factory.get("/oauth2/logout/callback")
        request.COOKIES[NEXT_URL_COOKIE_NAME] = "/admin/"

        view = KesaseteliADFSLogoutCallbackView.as_view()
        response = view(request)

        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, "/admin/")
        self.assertIn(NEXT_URL_COOKIE_NAME, response.cookies)
        # Verify cookie is deleted (expires in past/empty value)
        self.assertEqual(response.cookies[NEXT_URL_COOKIE_NAME].value, "")

    def test_get_redirects_to_default_without_cookie(self):
        request = self.factory.get("/oauth2/logout/callback")
        # No cookie set

        view = KesaseteliADFSLogoutCallbackView.as_view()
        response = view(request)

        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, "/")  # Default

    def test_get_redirects_to_default_with_unsafe_cookie(self):
        request = self.factory.get("/oauth2/logout/callback")
        request.COOKIES[NEXT_URL_COOKIE_NAME] = "https://evil.com"

        view = KesaseteliADFSLogoutCallbackView.as_view()
        response = view(request)

        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, "/")
