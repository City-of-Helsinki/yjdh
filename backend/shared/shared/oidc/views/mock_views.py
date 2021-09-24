from django import forms
from django.conf import settings
from django.contrib import auth
from django.contrib.auth import get_user_model
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.generic import FormView, View

from shared.oidc.services import clear_user_sessions
from shared.oidc.tests.data.dummy_data import DUMMY_ORGANIZATION_ROLES
from shared.oidc.tests.factories import UserFactory


class MockLogoutView(View):
    """Mocked user logout"""

    http_method_names = ["get", "post"]

    def handle_logout(self, request):
        if request.user.is_authenticated:
            clear_user_sessions(request.user)
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


class MockLoginForm(forms.Form):
    username = forms.CharField(required=False)
    business_id = forms.CharField(required=False)


class MockAuthenticationRequestView(FormView):
    """Mocked OIDC client authentication HTTP endpoint"""

    template_name = "mock_authentication.html"
    form_class = MockLoginForm
    success_url = settings.LOGIN_REDIRECT_URL or "/"

    @method_decorator(ensure_csrf_cookie)
    def get(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return super().get(request, *args, **kwargs)
        return HttpResponseRedirect(self.get_success_url())

    @method_decorator(ensure_csrf_cookie)
    def post(self, request, *args, **kwargs):
        User = get_user_model()
        if username := request.POST.get("username"):
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                user = UserFactory(username=username)
        else:
            user = UserFactory()

        org_roles = dict(DUMMY_ORGANIZATION_ROLES)

        if business_id := request.POST.get("business_id"):
            org_roles["identifier"] = business_id

        request.session["organization_roles"] = org_roles

        clear_user_sessions(user)
        auth.login(request, user, backend="django.contrib.auth.backends.ModelBackend")
        return super().post(request, *args, **kwargs)
