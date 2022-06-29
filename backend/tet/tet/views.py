from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect
from django.views import View


class UserInfoView(View):
    """Get userinfo of the logged in user"""

    http_method_names = ["get"]

    def get(self, request):
        if request.user.is_authenticated:
            user = request.user
            userinfo = {
                "given_name": user.first_name,
                "family_name": user.last_name,
                "email": user.email,
                "name": f"{user.first_name} {user.last_name}",
                "industry": "",
                "username": user.username,  # TODO check if this can be removed
                "is_ad_login": user.is_staff,
            }

            if not (userinfo["given_name"] or userinfo["family_name"]):
                userinfo["name"] = user.email

            return JsonResponse(userinfo)
        else:
            return HttpResponse("Unauthorized", status=401)


class TetLogoutView(View):
    """Log out user based on login type"""

    http_method_names = ["get"]

    def get(self, request):
        user = request.user
        if user.is_authenticated:
            if user.is_staff:
                return redirect("/oauth2/logout")
            else:
                return redirect("/oidc/logout/")
        else:
            return redirect(settings.LOGIN_REDIRECT_URL)
