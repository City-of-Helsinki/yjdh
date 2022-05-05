from django.conf import settings
from django.contrib import auth
from django.http import HttpResponseRedirect
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.generic import View
from shared.common.tests.factories import StaffUserFactory


class MockLogoutView(View):
    """Mocked user logout"""

    http_method_names = ["get", "post"]

    def handle_logout(self, request):
        if request.user.is_authenticated:
            auth.logout(request)
        return HttpResponseRedirect(settings.LOGOUT_REDIRECT_URL)

    def get(self, request):
        return self.handle_logout(request)

    def post(self, request):
        return self.handle_logout(request)


class MockLoginView(View):
    """Mocked user login"""

    http_method_names = ["get"]

    @method_decorator(ensure_csrf_cookie)
    def get(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            user = StaffUserFactory()
            auth.login(
                request,
                user,
                backend="django.contrib.auth.backends.ModelBackend",
            )
        return HttpResponseRedirect(settings.LOGIN_REDIRECT_URL or "/")
