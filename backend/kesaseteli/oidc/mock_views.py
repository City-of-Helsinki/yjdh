from django.conf import settings
from django.contrib import auth
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.views.generic import View

from applications.tests.factories import UserFactory


class MockLogoutView(View):
    """Mocked user logout"""

    http_method_names = ["get", "post"]

    def handle_logout(self, request):
        if request.user.is_authenticated:
            auth.logout(request)
        return HttpResponseRedirect(settings.LOGOUT_REDIRECT_URL or "/")

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
                "sub": "82e17287-f34e-4e4b-b3d2-15857b3f952a",
                "national_id_num": "210281-9988",
                "name": f"{user.first_name} {user.last_name}",
                "preferred_username": user.username,
                "given_name": user.first_name,
                "family_name": user.last_name,
            }
            return JsonResponse(userinfo)
        else:
            return HttpResponse("Unauthorized", status=401)


class MockAuthenticationRequestView(View):
    """Mocked OIDC client authentication HTTP endpoint"""

    http_method_names = ["get"]

    def get(self, request):
        if not request.user.is_authenticated:
            user = UserFactory()
            auth.login(
                request, user, backend="django.contrib.auth.backends.ModelBackend"
            )
        return HttpResponseRedirect(settings.LOGIN_REDIRECT_URL or "/")
