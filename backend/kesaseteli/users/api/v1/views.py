from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from users.api.v1.serializers import UserSerializer


@extend_schema(
    description=(
        "API for retrieving information about the currently logged in user,"
        " including the capabilities that the user's ADFS group memberships grant."
    ),
    responses=UserSerializer,
)
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        serializer = UserSerializer(request.user, context={"request": request})
        return Response(serializer.data)
