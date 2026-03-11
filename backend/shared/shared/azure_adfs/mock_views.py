import logging
from urllib.parse import urljoin, urlparse

from django.conf import settings
from django.contrib import auth
from django.shortcuts import redirect
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.generic import View
from factory.faker import faker

from shared.common.tests.factories import UserFactory

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
        if next_url and url_has_allowed_host_and_scheme(
            url=next_url,
            allowed_hosts={request.get_host()},
            require_https=request.is_secure(),
        ):
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
        # Derive allowed hosts from the configured CORS origins to ensure that
        # url_has_allowed_host_and_scheme receives a proper host allow-list.
        allowed_hosts = {
            urlparse(origin).netloc
            for origin in getattr(settings, "CORS_ALLOWED_ORIGINS", []) or []
            if urlparse(origin).netloc
        }
        if next_url and url_has_allowed_host_and_scheme(
            url=next_url,
            allowed_hosts=allowed_hosts,
            require_https=request.is_secure(),
        ):
            redirect_url = next_url
        else:
            redirect_url = urljoin(
                settings.ADFS_LOGIN_REDIRECT_URL, "/login?logout=true"
            )
        return redirect(redirect_url)
