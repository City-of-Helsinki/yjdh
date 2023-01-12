from typing import Optional

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import PermissionDenied
from django.db import transaction
from django.http import Http404
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema
from helsinki_gdpr.views import (
    DatabaseError,
    DeletionNotAllowed,
    DryRunException,
    GDPRAPIView,
)
from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.views import APIView

from common.permissions import BFIsAuthenticated
from users.api.v1.serializers import UserSerializer
from users.utils import set_mock_user_name

User = get_user_model()


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
        if not request.user.is_authenticated and not settings.NEXT_PUBLIC_MOCK_FLAG:
            raise PermissionDenied
        if settings.NEXT_PUBLIC_MOCK_FLAG and isinstance(request.user, AnonymousUser):
            set_mock_user_name(request.user)
        return request.user


class UserUuidGDPRAPIView(GDPRAPIView):
    """
    Test without auth.
    """

    authentication_classes = []
    permission_classes = []

    def delete(self, request, *args, **kwargs):
        return Response(status=status.HTTP_403_FORBIDDEN)
