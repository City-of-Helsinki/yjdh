from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect
from django.views import View

from events.utils import get_organization_name
from shared.azure_adfs.auth import is_adfs_login


class UserInfoView(View):
    """Get userinfo of the logged in user"""

    http_method_names = ["get"]

    def get(self, request):
        if request.user.is_authenticated:
            user = request.user

            # If logged in using ADFS but did not qualify as a handler
            if is_adfs_login(user) and not user.is_staff:
                return HttpResponse("Forbidden", status=403)

            userinfo = {
                "given_name": user.first_name,
                "family_name": user.last_name,
                "email": user.email,
                "name": f"{user.first_name} {user.last_name}".strip(),
                "is_adfs_login": is_adfs_login(user),
                "organization_name": get_organization_name(request),
            }

            if not (userinfo["given_name"] or userinfo["family_name"]):
                userinfo["name"] = user.email

            if not userinfo["name"]:
                userinfo["name"] = userinfo["organization_name"]

            return JsonResponse(userinfo)
        else:
            return HttpResponse("Unauthorized", status=401)


class TetLogoutView(View):
    """Log out user based on login type"""

    http_method_names = ["get"]

    def get(self, request):
        user = request.user
        if user.is_authenticated:
            if user.is_staff or is_adfs_login(user):
                # User is qualified as a handler which implies having logged in using
                # ADFS or they've been marked as having logged in using ADFS.
                return redirect("/oauth2/logout")
            else:
                return redirect("/oidc/logout/")
        else:
            return redirect(settings.LOGIN_REDIRECT_URL)
