from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.base_user import AbstractBaseUser
from django.core.exceptions import PermissionDenied
from django.db import DatabaseError, transaction
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from helsinki_gdpr.views import DeletionNotAllowed, DryRunException, GDPRAPIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from common.permissions import BFIsAuthenticated
from users.api.v1.authentications import HelsinkiProfileApiTokenAuthentication
from users.api.v1.permissions import BFGDPRScopesPermission
from users.api.v1.serializers import UserSerializer

User = get_user_model()


@extend_schema(
    description="API for retrieving information about the currently logged in user."
)
class CurrentUserView(APIView):
    # TermsOfServiceAccepted is not required here, so that the frontend is able to
    # check if terms approval is required.
    permission_classes = [BFIsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(
            self._get_current_user(request), context={"request": request}
        )
        response = serializer.data
        response["csrf_token"] = get_token(request)
        return Response(response)

    def _get_current_user(self, request):
        if not request.user.is_authenticated:
            raise PermissionDenied
        return request.user


@extend_schema(description="API for setting currently logged in user's language.")
class UserOptionsView(APIView):
    permission_classes = [BFIsAuthenticated]

    def get(self, request):
        lang = request.GET.get("lang")

        if lang in ["fi", "en", "sv"]:
            response = Response({"lang": lang}, status=status.HTTP_200_OK)
            response.set_cookie(settings.LANGUAGE_COOKIE_NAME, lang, httponly=True)
            return response

        return Response(status=status.HTTP_400_BAD_REQUEST)


class UserUuidGDPRAPIView(GDPRAPIView):
    """GDPR API view that is used from Helsinki profile to query and delete user data."""  # noqa: E501

    permission_classes = [BFGDPRScopesPermission]
    authentication_classes = [HelsinkiProfileApiTokenAuthentication]

    def get_object(self) -> AbstractBaseUser:
        """Get user by Helsinki-profile user ID that is stored as username."""
        obj = get_object_or_404(User, username=self.kwargs["uuid"])
        self.check_object_permissions(self.request, obj)
        return obj

    def delete(self, *args, **kwargs):
        """Delete all data related to the given user."""
        try:
            with transaction.atomic():
                user = self.get_object()
                user.delete()
                self.check_dry_run()
        except DryRunException:
            pass
        except DatabaseError:
            raise DeletionNotAllowed()

        return Response(status=status.HTTP_204_NO_CONTENT)
