from django.core import exceptions
from django.db.models import Func
from django.http import FileResponse, HttpResponse
from django.utils.text import format_lazy
from django.utils.translation import gettext_lazy as _
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.generics import ListAPIView
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from shared.audit_log.viewsets import AuditLoggingModelViewSet

from applications.api.v1.permissions import (
    ALLOWED_APPLICATION_UPDATE_STATUSES,
    ALLOWED_APPLICATION_VIEW_STATUSES,
    ApplicationPermission,
    get_user_company,
    StaffPermission,
    SummerVoucherPermission,
)
from applications.api.v1.serializers import (
    ApplicationSerializer,
    AttachmentSerializer,
    SchoolSerializer,
    SummerVoucherSerializer,
    YouthApplicationSerializer,
)
from applications.enums import ApplicationStatus
from applications.models import EmployerApplication, School, SummerVoucher, YouthApplication
from common.utils import DenyAll


class SchoolListView(ListAPIView):
    # PostgreSQL specific functionality:
    # - Custom sorter for name field to ensure finnish language sorting order.
    # - NOTE: This can be removed if the database is made to use collation fi_FI.UTF8
    _name_fi = Func(
        "name",
        function="fi-FI-x-icu",  # fi_FI.UTF8 would be best but wasn't available
        template='(%(expressions)s) COLLATE "%(function)s"',
    )

    queryset = School.objects.active().order_by(_name_fi.asc())
    serializer_class = SchoolSerializer

    def get_permissions(self):
        permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]


class YouthApplicationViewSet(AuditLoggingModelViewSet):
    queryset = YouthApplication.objects.all()
    serializer_class = YouthApplicationSerializer

    @action(methods=["get"], detail=True)
    def activate(self, request, pk=None) -> HttpResponse:
        try:
            youth_application = YouthApplication.objects.get(pk=pk)
        except (exceptions.ValidationError, YouthApplication.DoesNotExist):
            return HttpResponse(status=status.HTTP_404_NOT_FOUND)

        if youth_application.is_active:
            return HttpResponse(
                status=status.HTTP_200_OK, content="Youth application already active"
            )
        elif youth_application.has_activation_link_expired:
            return HttpResponse(
                status=status.HTTP_401_UNAUTHORIZED,
                content="Activation link has expired",
            )
        elif youth_application.activate():
            return HttpResponse(
                status=status.HTTP_200_OK, content="Youth application activated"
            )

        return HttpResponse(
            status=status.HTTP_401_UNAUTHORIZED,
            content="Unable to activate youth application",
        )

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        youth_application = YouthApplication.objects.get(id=response.data["id"])
        youth_application.send_activation_email(request)
        return response

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ["activate", "create"]:
            permission_classes = [AllowAny]
        else:
            permission_classes = [DenyAll]
        return [permission() for permission in permission_classes]


class ApplicationViewSet(AuditLoggingModelViewSet):
    queryset = EmployerApplication.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, ApplicationPermission]

    def get_queryset(self):
        """
        Fetch all DRAFT status applications of the user & company.
        Should inlcude only 1 application since we don't allow creation of multiple
        DRAFT applications per user & company.
        """
        queryset = (
            super()
            .get_queryset()
            .select_related("company")
            .prefetch_related("summer_vouchers")
        )

        user = self.request.user
        if user.is_anonymous:
            return queryset.none()

        user_company = get_user_company(self.request)

        return queryset.filter(
            company=user_company,
            user=user,
            status__in=ALLOWED_APPLICATION_VIEW_STATUSES,
        )

    def create(self, request, *args, **kwargs):
        """
        Allow only 1 (DRAFT) application per user & company.
        """
        if self.get_queryset().filter(status=ApplicationStatus.DRAFT).exists():
            raise ValidationError("Company & user can have only one draft application")
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """
        Allow to update only DRAFT status applications.
        """
        instance = self.get_object()
        if instance.status not in ALLOWED_APPLICATION_UPDATE_STATUSES:
            raise ValidationError("Only DRAFT applications can be updated")
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


class SummerVoucherViewSet(AuditLoggingModelViewSet):
    queryset = SummerVoucher.objects.all()
    serializer_class = SummerVoucherSerializer
    permission_classes = [IsAuthenticated, StaffPermission | SummerVoucherPermission]

    def get_queryset(self):
        """
        Fetch summer vouchers of DRAFT status applications of the user & company.
        """
        queryset = (
            super()
            .get_queryset()
            .select_related("application")
            .prefetch_related("attachments")
        )

        user = self.request.user
        if user.is_staff:
            return queryset
        elif user.is_anonymous:
            return queryset.none()

        user_company = get_user_company(self.request)

        return queryset.filter(
            application__company=user_company,
            application__user=user,
            application__status__in=ALLOWED_APPLICATION_VIEW_STATUSES,
        )

    def create(self, request, *args, **kwargs):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def update(self, request, *args, **kwargs):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def retrieve(self, request, *args, **kwargs):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def list(self, request, *args, **kwargs):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def destroy(self, request, *args, **kwargs):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @action(
        methods=("POST",),
        detail=True,
        url_path="attachments",
        parser_classes=(MultiPartParser,),
    )
    def post_attachment(self, request, *args, **kwargs):
        """
        Upload a single file as attachment
        """
        obj = self.get_object()

        if obj.application.status not in ALLOWED_APPLICATION_UPDATE_STATUSES:
            raise ValidationError(
                "Attachments can be uploaded only for DRAFT applications"
            )

        # Validate request data
        serializer = AttachmentSerializer(
            data={
                "summer_voucher": obj.id,
                "attachment_file": request.data["attachment_file"],
                "content_type": request.data["attachment_file"].content_type,
                "attachment_type": request.data["attachment_type"],
            }
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(
        methods=(
            "GET",
            "DELETE",
        ),
        detail=True,
        url_path="attachments/(?P<attachment_pk>[^/.]+)",
    )
    def handle_attachment(self, request, attachment_pk, *args, **kwargs):
        obj = self.get_object()

        if request.method == "GET":
            """
            Read a single attachment as file
            """
            attachment = obj.attachments.filter(pk=attachment_pk).first()
            if not attachment or not attachment.attachment_file:
                return Response(
                    {
                        "detail": format_lazy(
                            _("File not found."),
                        )
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )
            return FileResponse(attachment.attachment_file)

        elif request.method == "DELETE":
            """
            Delete a single attachment as file
            """
            if obj.application.status not in ALLOWED_APPLICATION_UPDATE_STATUSES:
                raise ValidationError(
                    "Attachments can be deleted only for DRAFT applications"
                )

            if (
                obj.application.status
                not in AttachmentSerializer.ATTACHMENT_MODIFICATION_ALLOWED_STATUSES
            ):
                return Response(
                    {"detail": _("Operation not allowed for this application status.")},
                    status=status.HTTP_403_FORBIDDEN,
                )
            try:
                instance = obj.attachments.get(id=attachment_pk)
            except exceptions.ObjectDoesNotExist:
                return Response(
                    {"detail": _("File not found.")}, status=status.HTTP_404_NOT_FOUND
                )
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
