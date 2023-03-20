import logging
from urllib.parse import urljoin

import factory
from django.conf import settings
from django.contrib import auth
from django.shortcuts import redirect
from django.views.generic import View

from shared.common.tests.factories import UserFactory

LOGGER = logging.getLogger(__name__)


class MockOAuth2LoginView(View):
    def get(self, request):
        return redirect("/oauth2/callback?code=mock_adfs_code")


class MockOAuth2CallbackView(View):
    def get(self, request):
        if not request.user.is_authenticated:
            user = UserFactory(
                username=f"handler_{factory.Faker('user_name')}",
                is_staff=True,
            )
            auth.login(
                request, user, backend="django.contrib.auth.backends.ModelBackend"  # type: ignore
            )
            request.session["_adfs_user_id"] = str(user.id)
        return redirect(settings.ADFS_LOGIN_REDIRECT_URL)


class MockOAuth2LogoutView(View):
    def get(self, request):
        auth.logout(request)
        logout_url = urljoin(settings.ADFS_LOGIN_REDIRECT_URL, "/login?logout=true")
        return redirect(logout_url)
