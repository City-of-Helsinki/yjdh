from django.conf import settings
from django.core.exceptions import PermissionDenied
from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView

from common.permissions import BFIsAuthenticated
from users.api.v1.serializers import UserSerializer


@extend_schema(
    description="API for retrieving information about the currently logged in user."
)
class CurrentUserView(APIView):

    # TermsOfServiceAccepted is not required here, so that the frontend is able to check if terms
    # approval is required.
    permission_classes = [BFIsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(
            self._get_current_user(request), context={"request": request}
        )
        return Response(serializer.data)

    def _get_current_user(self, request):
        if not request.user.is_authenticated and not settings.DISABLE_AUTHENTICATION:
            raise PermissionDenied
        return request.user
