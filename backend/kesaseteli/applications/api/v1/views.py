import logging
from functools import cached_property

from django.conf import settings
from django.core import exceptions
from django.db import transaction
from django.db.models import F, Func
from django.db.utils import ProgrammingError
from django.http import FileResponse, HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import redirect
from django.utils import translation
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
    EmployerApplicationPermission,
    EmployerSummerVoucherPermission,
    get_user_company,
    StaffPermission,
)
from applications.api.v1.serializers import (
    AttachmentSerializer,
    EmployerApplicationSerializer,
    EmployerSummerVoucherSerializer,
    SchoolSerializer,
    YouthApplicationSerializer,
    YouthApplicationStatusSerializer,
)
from applications.enums import (
    EmployerApplicationStatus,
    YouthApplicationRejectedReason,
    YouthApplicationStatus,
)
from applications.models import (
    EmployerApplication,
    EmployerSummerVoucher,
    School,
    YouthApplication,
)
from common.decorators import enforce_handler_view_adfs_login

LOGGER = logging.getLogger(__name__)


class SchoolListView(ListAPIView):
    serializer_class = SchoolSerializer

    # PostgreSQL specific functionality:
    # - Custom sorter for name field to ensure finnish language sorting order.
    # - NOTE: This can be removed if the database is made to use collation fi_FI.utf8
    # TODO: Remove this after fixing related GitHub workflows to use Finnish PostgreSQL
    def get_sorter(self, field_name, collation):
        if collation is None:
            return F(field_name)
        else:
            return Func(
                field_name,
                function=collation,
                template='(%(expressions)s) COLLATE "%(function)s"',
            )

    def get_collations(self):
        return [
            "fi_FI.utf8",  # PostgreSQL UTF-8 version
            "Finnish_Swedish_CI_AS_UTF8",  # Azure's UTF-8 version
            "fi-FI-x-icu",  # PostgreSQL fallback
            None,  # No collation override
        ]

    def get_sorters(self):
        return [
            self.get_sorter("name", collation) for collation in self.get_collations()
        ]

    @cached_property
    def preferred_sorter(self):
        for sorter in self.get_sorters():
            # Try out different order by functions until a functional one is found
            try:
                # Use transaction to avoid django.db.utils.InternalError:
                # "current transaction is aborted, commands ignored until end of
                # transaction block"
                with transaction.atomic():
                    # Force evaluation of queryset to test sorting function
                    list(School.objects.order_by(sorter.asc()))
                return sorter
            except ProgrammingError:  # Collation for encoding does not exist
                pass
        raise ProgrammingError("Unable to determine working collation for school list")

    def get_queryset(self):
        return School.objects.order_by(self.preferred_sorter.asc())

    def get_permissions(self):
        permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]


class YouthApplicationViewSet(AuditLoggingModelViewSet):
    permission_classes = [AllowAny]  # Permissions are handled per function
    queryset = YouthApplication.objects.all()
    serializer_class = YouthApplicationSerializer

    def list(self, request, *args, **kwargs):
        self._log_permission_denied()
        return Response(status=status.HTTP_403_FORBIDDEN)

    def update(self, request, *args, **kwargs):
        self._log_permission_denied()
        return Response(status=status.HTTP_403_FORBIDDEN)

    def partial_update(self, request, *args, **kwargs):
        self._log_permission_denied()
        return Response(status=status.HTTP_403_FORBIDDEN)

    def destroy(self, request, *args, **kwargs):
        self._log_permission_denied()
        return Response(status=status.HTTP_403_FORBIDDEN)

    @action(methods=["get"], detail=True)
    def status(self, request, *args, **kwargs) -> HttpResponse:
        with self.record_action(additional_information="status"):
            serializer = YouthApplicationStatusSerializer(
                self.get_object(),
                context=self.get_serializer_context(),
            )
            return Response(serializer.data)

    @enforce_handler_view_adfs_login
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @action(methods=["get"], detail=True)
    @enforce_handler_view_adfs_login
    def process(self, request, *args, **kwargs) -> HttpResponse:
        youth_application: YouthApplication = self.get_object()
        return redirect(youth_application.handler_processing_url())

    @transaction.atomic
    @action(methods=["patch"], detail=True)
    @enforce_handler_view_adfs_login
    def accept(self, request, *args, **kwargs) -> HttpResponse:
        youth_application: YouthApplication = self.get_object().lock_for_update()

        if not youth_application.is_accepted and youth_application.accept(
            handler=request.user
        ):
            was_email_sent = (
                youth_application.youth_summer_voucher.send_youth_summer_voucher_email(
                    language=youth_application.language
                )
            )
            if not was_email_sent:
                transaction.set_rollback(True)
                with translation.override(youth_application.language):
                    return HttpResponse(
                        _("Failed to send youth summer voucher email"),
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )
            with self.record_action(additional_information="accept"):
                return HttpResponse(status=status.HTTP_200_OK)
        else:
            return HttpResponse(status=status.HTTP_400_BAD_REQUEST)

    @transaction.atomic
    @action(methods=["patch"], detail=True)
    @enforce_handler_view_adfs_login
    def reject(self, request, *args, **kwargs) -> HttpResponse:
        youth_application: YouthApplication = self.get_object().lock_for_update()

        if not youth_application.is_rejected and youth_application.reject(
            handler=request.user
        ):
            with self.record_action(additional_information="reject"):
                return HttpResponse(status=status.HTTP_200_OK)
        else:
            return HttpResponse(status=status.HTTP_400_BAD_REQUEST)

    @transaction.atomic
    @action(methods=["get"], detail=True)
    def activate(self, request, *args, **kwargs) -> HttpResponse:
        youth_application: YouthApplication = self.get_object()

        # Lock same person's applications to prevent activation of more than one of them
        same_persons_apps = YouthApplication.objects.select_for_update().filter(
            social_security_number=youth_application.social_security_number
        )
        list(same_persons_apps)  # Force evaluation of queryset to lock its rows

        if same_persons_apps.active().exists():
            return HttpResponseRedirect(youth_application.already_activated_page_url())
        elif youth_application.has_activation_link_expired:
            return HttpResponseRedirect(youth_application.expired_page_url())
        elif youth_application.activate():
            if settings.DISABLE_VTJ:
                LOGGER.info(
                    f"Activated youth application {youth_application.pk}: "
                    "VTJ is disabled, sending application to be processed by a handler"
                )
                youth_application.status = (
                    YouthApplicationStatus.AWAITING_MANUAL_PROCESSING
                )
                youth_application.save()
                was_email_sent = youth_application.send_processing_email_to_handler(
                    request
                )
                if not was_email_sent:
                    transaction.set_rollback(True)
                    with translation.override(youth_application.language):
                        return HttpResponse(
                            _("Failed to send manual processing email to handler"),
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        )
            else:
                # TODO: Implement VTJ integration
                LOGGER.error(
                    f"Tried to activate youth application {youth_application.pk}: "
                    "Failed because VTJ integration is enabled but not implemented"
                )
                transaction.set_rollback(True)
                return HttpResponse(
                    _("VTJ integration is not implemented"),
                    status=status.HTTP_501_NOT_IMPLEMENTED,
                )

            return HttpResponseRedirect(youth_application.activated_page_url())

        return HttpResponse(
            status=status.HTTP_401_UNAUTHORIZED,
            content="Unable to activate youth application",
        )

    @classmethod
    def error_response_with_logging(
        cls, reason: YouthApplicationRejectedReason
    ) -> JsonResponse:
        response_status = status.HTTP_400_BAD_REQUEST
        response_data = reason.json()
        LOGGER.info(
            f"Youth application submission rejected. "
            f"Return HTTP status code: {response_status}. "
            f"YouthApplicationRejectedReason: {response_data.get('code')}."
        )
        return JsonResponse(status=response_status, data=response_data)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        try:
            # This function is based on CreateModelMixin class's create function.
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            # Data is valid but let's check other criteria before creating the object
            email = serializer.validated_data["email"]
            social_security_number = serializer.validated_data["social_security_number"]

            if YouthApplication.is_email_or_social_security_number_active(
                email, social_security_number
            ):
                return self.error_response_with_logging(
                    YouthApplicationRejectedReason.ALREADY_ASSIGNED
                )
            elif YouthApplication.is_email_used(email):
                return self.error_response_with_logging(
                    YouthApplicationRejectedReason.EMAIL_IN_USE
                )

            # Data was valid and other criteria passed too, so let's create the object
            self.perform_create(serializer)

            # Send the localized activation email
            youth_application = serializer.instance
            was_email_sent = youth_application.send_activation_email(
                request, youth_application.language
            )

            if not was_email_sent:
                transaction.set_rollback(True)
                with translation.override(youth_application.language):
                    return HttpResponse(
                        _("Failed to send activation email"),
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )

            # Return success creating the object
            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data, status=status.HTTP_201_CREATED, headers=headers
            )
        except ValidationError as e:
            LOGGER.error(
                f"Youth application submission rejected because of validation error. "
                f"Validation error codes: {str(e.get_codes())}"
            )
            raise


class EmployerApplicationViewSet(AuditLoggingModelViewSet):
    queryset = EmployerApplication.objects.all()
    serializer_class = EmployerApplicationSerializer
    permission_classes = [IsAuthenticated, EmployerApplicationPermission]

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
        if self.get_queryset().filter(status=EmployerApplicationStatus.DRAFT).exists():
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


class EmployerSummerVoucherViewSet(AuditLoggingModelViewSet):
    queryset = EmployerSummerVoucher.objects.all()
    serializer_class = EmployerSummerVoucherSerializer
    permission_classes = [
        IsAuthenticated,
        StaffPermission | EmployerSummerVoucherPermission,
    ]

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
