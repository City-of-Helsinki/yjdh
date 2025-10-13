from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied
from django.middleware.csrf import get_token
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from common.permissions import BFIsAuthenticated
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
