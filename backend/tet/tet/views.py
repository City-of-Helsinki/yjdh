from django.http import HttpResponse, JsonResponse
from django.views import View

from events.utils import get_organization_name


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
                "is_ad_login": user.is_staff,
                "organization_name": get_organization_name(request),
            }

            if not (userinfo["given_name"] or userinfo["family_name"]):
                userinfo["name"] = user.email

            return JsonResponse(userinfo)
        else:
            return HttpResponse("Unauthorized", status=401)
