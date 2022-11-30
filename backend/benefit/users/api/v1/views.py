from django.conf import settings
from django.http import Http404
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import PermissionDenied
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound

from common.permissions import BFIsAuthenticated
from helsinki_gdpr.views import DeletionNotAllowed, GDPRAPIView
from users.api.v1.serializers import UserSerializer
from users.utils import set_mock_user_name
from typing import Optional

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
    GDPRAPIView which finds User instance by user UUID

    This view is customized because helsinki-profile-gdpr-api expects the URL to
    have the id of the GDPR_API_MODEL. In this example we have the user's UUID but
    need to find the corresponding User instance instead.
    """

    def get_object(self) -> User:
        """
        Get the user corresponding the user UUID provided in the URL
        """
        user: User = get_object_or_404(User, user__uuid=self.kwargs["uuid"])
        self.check_object_permissions(self.request, user)
        return user

    def delete(self, request, *args, **kwargs) -> Optional[Response]:
        """
        Delete user's data if possible
        """
        user: User = self.get_object()
        if not user.is_deletion_allowed():
            raise DeletionNotAllowed()

        try:
            with transaction.atomic():
                user.delete()
                self.check_dry_run()
        except DryRunException:
            # Deletion is possible. Due to dry run, transaction is rolled back.
            pass
        except DatabaseError:
            raise DeletionNotAllowed()

        return Response(status=status.HTTP_204_NO_CONTENT)
