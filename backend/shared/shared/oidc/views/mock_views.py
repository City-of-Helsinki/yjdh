from django.conf import settings
from django.contrib import auth
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.generic import View

from shared.common.tests.factories import UserFactory


class MockLogoutView(View):
    """Mocked user logout"""

    http_method_names = ["get", "post"]

    def handle_logout(self, request):
        if request.user.is_authenticated:
            auth.logout(request)
        return HttpResponse("OK", status=200)

    def get(self, request):
        return self.handle_logout(request)

    def post(self, request):
        return self.handle_logout(request)


class MockUserInfoView(View):
    """Get mocked userinfo of the logged in user"""

    http_method_names = ["get"]

    def get(self, request):
        if request.user.is_authenticated:
            user = request.user
            userinfo = {
                "given_name": user.first_name,
                "family_name": user.last_name,
                "name": f"{user.first_name} {user.last_name}",
            }
            return JsonResponse(userinfo)
        else:
            return HttpResponse("Unauthorized", status=401)


class MockAuthenticationRequestView(View):
    """Mocked OIDC client authentication HTTP endpoint"""

    http_method_names = ["get"]

    @method_decorator(ensure_csrf_cookie)
    def get(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            user = UserFactory()
            auth.login(
                request, user, backend="django.contrib.auth.backends.ModelBackend"
            )
        return HttpResponseRedirect(settings.LOGIN_REDIRECT_URL or "/")
