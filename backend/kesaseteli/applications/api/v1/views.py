from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from shared.audit_log.viewsets import AuditLoggingModelViewSet

from applications.api.v1.serializers import ApplicationSerializer
from applications.enums import ApplicationStatus
from applications.models import Application


class ApplicationViewSet(AuditLoggingModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        """
        Fetch all DRAFT status applications of the company.
        Should inlcude only 1 application since we don't allow creation of multiple
        DRAFT applications per company.
        """
        queryset = (
            super()
            .get_queryset()
            .select_related("company")
            .prefetch_related("summer_vouchers")
        )
        eauth_profile = self.request.user.oidc_profile.eauthorization_profile
        user_company = getattr(eauth_profile, "company", None)
        return queryset.filter(company=user_company, status=ApplicationStatus.DRAFT)

    def create(self, request, *args, **kwargs):
        """
        Allow only 1 (DRAFT) application per company.
        """
        if self.get_queryset().exists():
            raise ValidationError("Company can have only one draft application")
        return super().create(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
