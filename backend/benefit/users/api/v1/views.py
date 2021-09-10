from drf_spectacular.utils import extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView
from users.api.v1.serializers import UserSerializer


@extend_schema(
    description="API for retrieving information about the currently logged in user."
)
class CurrentUserView(APIView):
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
