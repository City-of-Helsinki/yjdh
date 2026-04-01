import logging
from urllib.parse import urljoin

from django.conf import settings
from django.contrib import auth
from django.shortcuts import redirect
from django.views.generic import View
from factory.faker import faker

from shared.common.tests.factories import UserFactory
from shared.common.utils import is_safe_redirect_url

LOGGER = logging.getLogger(__name__)


class MockOAuth2LoginView(View):
    def get(self, request):
        next_url = request.GET.get("next")
        callback_url = "/oauth2/callback?code=mock_adfs_code"
        if next_url:
            callback_url += f"&next={next_url}"
        return redirect(callback_url)


class MockOAuth2CallbackView(View):
    def get(self, request):
        if not request.user.is_authenticated:
            user = UserFactory(
                username=f"handler_{faker.Faker().user_name()}",
                is_staff=True,
            )
            auth.login(
                request,
                user,
                backend="django.contrib.auth.backends.ModelBackend",  # type: ignore
            )
            request.session["_adfs_user_id"] = str(user.id)

        next_url = request.GET.get("next")
        # To support cross-origin redirects in local development (e.g., from backend
        # on localhost:8000 to Handler UI on localhost:3200), we must authorize
        # the destination. Standard Django security (url_has_allowed_host_and_scheme)
        # requires an explicit allow-list of hosts to permit cross-origin jumps.
        if is_safe_redirect_url(request, next_url):
            redirect_url = next_url
        else:
            redirect_url = settings.ADFS_LOGIN_REDIRECT_URL
        return redirect(redirect_url)


class MockOAuth2LogoutView(View):
    def get(self, request):
        auth.logout(request)
        # Similar to the real Azure AD flow via HelsinkiOAuth2LogoutView,
        # we extract the `next` parameter so local development can dynamically
        # redirect back to the correct client (e.g., Handlers UI on localhost:3200)
        # instead of falling back to a static default.
        next_url = request.GET.get("next")
        # Standard Django security requires an explicit allow-list of hosts to permit
        # cross-origin redirects.
        if is_safe_redirect_url(request, next_url):
            redirect_url = next_url
        else:
            redirect_url = urljoin(
                settings.ADFS_LOGIN_REDIRECT_URL, "/login?logout=true"
            )
        return redirect(redirect_url)
