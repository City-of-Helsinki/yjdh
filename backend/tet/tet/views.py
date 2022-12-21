from typing import Optional

from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect
from django.views import View

# TECHNICAL DEBT:
# Import using a private module i.e. one starting with a single underscore.
# "from helusers.oidc import ApiTokenAuthentication" lead to problems as we don't
# use django-helusers package's user model.
from helusers._oidc_auth_impl import ApiTokenAuthentication
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.views import APIView

from events.utils import get_organization_name
from shared.azure_adfs.auth import is_adfs_login

User = get_user_model()


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


class GDPRScopesPermission(IsAuthenticated):
    """
    A near copy of GDPRScopesPermission from helsinki-profile-gdpr-api, see
    https://github.com/City-of-Helsinki/helsinki-profile-gdpr-api/blob/release-0.1.0/helsinki_gdpr/views.py#L30-L43

    TECHNICAL DEBT:
        Copied because "from helsinki_gdpr.views import GDPRScopesPermission" lead to
        "from helusers.oidc import ApiTokenAuthentication" which lead to problems as we
        don't use django-helusers package's user model.
    """

    def has_permission(self, request, view):
        authenticated = super().has_permission(request, view)
        if authenticated:
            if request.method == "GET":
                return request.auth.has_api_scopes(settings.GDPR_API_QUERY_SCOPE)
            elif request.method == "DELETE":
                return request.auth.has_api_scopes(settings.GDPR_API_DELETE_SCOPE)
        return False


class TetGDPRAPIView(APIView):
    """
    A dummy GDPR API view which returns success on both get and delete operations
    """

    renderer_classes = [JSONRenderer]
    authentication_classes = [ApiTokenAuthentication]
    permission_classes = [GDPRScopesPermission]

    def get(self, request, *args, **kwargs):
        return Response(status=status.HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        return Response(status=status.HTTP_204_NO_CONTENT)


def resolve_user(_, payload) -> Optional[User]:
    """
    User resolver function for django-helusers ApiTokenAuthentication.

    :param _: request
    :param payload: JWT token payload

    Configured using settings.OIDC_API_TOKEN_AUTH["USER_RESOLVER"], e.g.
        OIDC_API_TOKEN_AUTH = {
            ...
            "USER_RESOLVER": "tet.views.resolve_user"
            ...
        }
    """
    try:
        return User.objects.get(username=payload["sub"])
    except User.objects.DoesNotExist:
        return None
