from rest_framework import status
from rest_framework.response import Response
from shared.audit_log.viewsets import AuditLoggingModelViewSet

from applications.api.v1.serializers import ApplicationSerializer
from applications.models import Application


class ApplicationViewSet(AuditLoggingModelViewSet):
    queryset = Application.objects.select_related("company").prefetch_related(
        "summer_vouchers"
    )
    serializer_class = ApplicationSerializer

    def destroy(self, request, *args, **kwargs):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
