import logging
import uuid
from functools import cached_property

from django.conf import settings
from django.core import exceptions
from django.db import models, transaction
from django.db.models import F, Func, Q
from django.db.models.functions import Concat
from django.db.utils import ProgrammingError
from django.http import FileResponse, HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import redirect
from django.utils import timezone, translation
from django.utils.decorators import method_decorator
from django.utils.text import format_lazy
from django.utils.translation import gettext_lazy as _
from django.views.decorators.csrf import csrf_protect
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.generics import ListAPIView
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from applications.api.v1.permissions import (
    ALLOWED_APPLICATION_UPDATE_STATUSES,
    ALLOWED_APPLICATION_VIEW_STATUSES,
    EmployerApplicationPermission,
    EmployerSummerVoucherPermission,
    get_user_company,
)
from applications.api.v1.serializers import (
    AttachmentSerializer,
    EmployerApplicationSerializer,
    EmployerSummerVoucherSerializer,
    NonVtjYouthApplicationSerializer,
    SchoolSerializer,
    YouthApplicationAdditionalInfoSerializer,
    YouthApplicationHandlingSerializer,
    YouthApplicationSerializer,
    YouthApplicationStatusSerializer,
)
from applications.enums import (
    AdditionalInfoUserReason,
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
from common.permissions import HandlerPermission
from shared.audit_log.viewsets import AuditLoggingModelViewSet
from shared.vtj.vtj_client import VTJClient

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
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def update(self, request, *args, **kwargs):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def partial_update(self, request, *args, **kwargs):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def destroy(self, request, *args, **kwargs):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @action(methods=["get"], detail=True)
    def status(self, request, *args, **kwargs) -> HttpResponse:
        with self.record_action(additional_information="status"):
            serializer = YouthApplicationStatusSerializer(
                self.get_object(),
                context=self.get_serializer_context(),
            )
            return Response(serializer.data)

    @transaction.atomic
    @enforce_handler_view_adfs_login
    def retrieve(self, request, *args, **kwargs):
        youth_application: YouthApplication = self.get_object().lock_for_update()
        # Update unhandled youth applications' encrypted_handler_vtj_json so
        # handlers can accept/reject using it
        if (
            youth_application.has_social_security_number
            and not youth_application.is_handled
        ):
            youth_application.encrypted_handler_vtj_json = (
                youth_application.fetch_vtj_json(
                    end_user=VTJClient.get_end_user(request)
                )
            )
            youth_application.save(update_fields=["encrypted_handler_vtj_json"])
        return super().retrieve(request, *args, **kwargs)

    @action(methods=["get"], detail=True)
    @enforce_handler_view_adfs_login
    def process(self, request, *args, **kwargs) -> HttpResponse:
        youth_application: YouthApplication = self.get_object()
        return redirect(youth_application.handler_processing_url())

    @transaction.atomic
    @action(methods=["post"], detail=True)
    def additional_info(self, request, *args, **kwargs) -> HttpResponse:
        youth_application: YouthApplication = self.get_object().lock_for_update()

        if not youth_application.can_set_additional_info:
            return Response(
                data={
                    "detail": (
                        _("Invalid status %(status)s for setting additional info")
                        % {"status": youth_application.status}
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            serializer = YouthApplicationAdditionalInfoSerializer(
                data=request.data, context=self.get_serializer_context()
            )
            serializer.is_valid(raise_exception=True)

            youth_application.set_additional_info(**serializer.validated_data)

            LOGGER.info(
                f"Set additional info to youth application {youth_application.pk}: "
                "Sending application to be processed by a handler"
            )
            was_email_sent = youth_application.send_processing_email_to_handler(request)
            if not was_email_sent:
                transaction.set_rollback(True)
                with translation.override(youth_application.language):
                    return HttpResponse(
                        _("Failed to send manual processing email to handler"),
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )

            # Return success setting the additional info
            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data, status=status.HTTP_201_CREATED, headers=headers
            )
        except ValidationError as e:
            LOGGER.error(
                "Youth application additional info rejected because of "
                f"validation error. Validation error codes: {str(e.get_codes())}"
            )
            raise

    @transaction.atomic
    @method_decorator(csrf_protect)
    @action(methods=["post"], detail=False)
    def fetch_employee_data(self, request, *args, **kwargs) -> HttpResponse:
        """
        Fetch employee data to a particular EmployerSummerVoucher using the
        employee's name and their YouthSummerVoucher's
        summer_voucher_serial_number.
        """
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_403_FORBIDDEN)
        try:
            employer_summer_voucher_id = uuid.UUID(
                request.data.get("employer_summer_voucher_id", "")
            )
            employee_name = str(request.data.get("employee_name", "")).strip()
            voucher_number = int(request.data.get("summer_voucher_serial_number", ""))
        except (KeyError, ValueError, TypeError):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        employer_summer_vouchers = EmployerSummerVoucher.objects.filter(
            id=employer_summer_voucher_id
        )
        if employer_summer_vouchers.count() != 1:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        youth_applications = (
            self.queryset.accepted()
            .filter(youth_summer_voucher__summer_voucher_serial_number=voucher_number)
            .annotate(
                employee_name=models.Value(
                    employee_name, output_field=models.CharField()
                )
            )
            .annotate(
                last_name_with_leading_space=Concat(
                    models.Value(" "), "last_name", output_field=models.CharField()
                )
            )
            .annotate(
                last_name_with_trailing_space=Concat(
                    "last_name", models.Value(" "), output_field=models.CharField()
                )
            )
            # If last_name is "Doe" then it matches e.g.
            # employee_name "John Doe", "Doe John", "Doe", "Mary Doe", "Doe Mary":
            #
            # NOTE: The trailing and leading spaces are needed in order not to match
            # e.g. last_name of "Korhonen" with employee_name of "N" or "Nen".
            .filter(
                Q(employee_name__iexact=F("last_name"))
                | Q(employee_name__istartswith=F("last_name_with_trailing_space"))
                | Q(employee_name__iendswith=F("last_name_with_leading_space"))
            )
        )
        if not youth_applications.exists():
            with self.record_action(
                target=YouthApplication,
                additional_information=(
                    "YouthApplicationViewSet.fetch_employee_data called with "
                    f'employer_summer_voucher_id="{employer_summer_voucher_id}", '
                    f'employee_name="{employee_name}" and '
                    f"summer_voucher_serial_number={voucher_number} "
                    "(POST used with CSRF as a GET). Found no matches."
                ),
            ):
                return Response(status=status.HTTP_404_NOT_FOUND)
        elif youth_applications.count() > 1:
            return Response(status=status.HTTP_409_CONFLICT)  # Should never happen
        youth_application: YouthApplication = youth_applications.first()

        with self.record_action(
            target=youth_application,
            additional_information=(
                "YouthApplicationViewSet.fetch_employee_data called with "
                f'employer_summer_voucher_id="{employer_summer_voucher_id}", '
                f'employee_name="{employee_name}" and '
                f"summer_voucher_serial_number={voucher_number} "
                "(POST used with CSRF as a GET). Found 1 match."
            ),
        ):
            return Response(
                data={
                    "employer_summer_voucher_id": str(employer_summer_voucher_id),
                    "employee_name": youth_application.name,
                    "employee_ssn": youth_application.social_security_number,
                    "employee_phone_number": youth_application.phone_number,
                    "employee_home_city": youth_application.home_municipality,
                    "employee_postcode": youth_application.postcode,
                    "employee_school": youth_application.school,
                },
                status=status.HTTP_200_OK,
            )

    @transaction.atomic
    @action(methods=["patch"], detail=True)
    @enforce_handler_view_adfs_login
    def accept(self, request, *args, **kwargs) -> HttpResponse:
        youth_application: YouthApplication = self.get_object().lock_for_update()

        if (
            settings.NEXT_PUBLIC_DISABLE_VTJ
            or not youth_application.has_social_security_number
        ):
            encrypted_handler_vtj_json = None
        else:
            try:
                serializer = YouthApplicationHandlingSerializer(
                    data=request.data, context=self.get_serializer_context()
                )
                serializer.is_valid(raise_exception=True)
            except ValidationError as e:
                LOGGER.error(
                    "Youth application was not changed to accepted state because of "
                    f"validation error. Validation error codes: {str(e.get_codes())}"
                )
                raise

            encrypted_handler_vtj_json = serializer.validated_data[
                "encrypted_handler_vtj_json"
            ]

        if not youth_application.is_accepted and youth_application.accept_manually(
            handler=request.user, encrypted_handler_vtj_json=encrypted_handler_vtj_json
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

        if (
            settings.NEXT_PUBLIC_DISABLE_VTJ
            or not youth_application.has_social_security_number
        ):
            encrypted_handler_vtj_json = None
        else:
            try:
                serializer = YouthApplicationHandlingSerializer(
                    data=request.data, context=self.get_serializer_context()
                )
                serializer.is_valid(raise_exception=True)
            except ValidationError as e:
                LOGGER.error(
                    "Youth application was not changed to rejected state because of "
                    f"validation error. Validation error codes: {str(e.get_codes())}"
                )
                raise

            encrypted_handler_vtj_json = serializer.validated_data[
                "encrypted_handler_vtj_json"
            ]

        if not youth_application.is_rejected and youth_application.reject(
            handler=request.user, encrypted_handler_vtj_json=encrypted_handler_vtj_json
        ):
            with self.record_action(additional_information="reject"):
                return HttpResponse(status=status.HTTP_200_OK)
        else:
            return HttpResponse(status=status.HTTP_400_BAD_REQUEST)

    @transaction.atomic
    @action(methods=["get"], detail=True)
    def activate(self, request, *args, **kwargs) -> HttpResponse:  # noqa: C901
        youth_application: YouthApplication = self.get_object()

        # Lock same person's this year's applications to prevent multiple activations
        same_persons_this_year_apps = (
            YouthApplication.objects.filter(
                social_security_number=youth_application.social_security_number
            )
            .created_this_year()
            .select_for_update()
        )
        list(same_persons_this_year_apps)  # Force evaluation to lock queryset's rows

        if same_persons_this_year_apps.active().non_rejected().exists():
            if (
                youth_application.is_active
                and not youth_application.is_rejected
                and youth_application.can_set_additional_info
            ):
                return HttpResponseRedirect(
                    youth_application.additional_info_page_url(pk=youth_application.pk)
                )
            else:  # not the active non-rejected one or does not need additional info
                return HttpResponseRedirect(
                    youth_application.already_activated_page_url()
                )
        elif youth_application.has_activation_link_expired:
            return HttpResponseRedirect(youth_application.expired_page_url())
        elif youth_application.activate():
            if youth_application.accept_automatically():
                LOGGER.info(
                    f"Activated youth application {youth_application.pk}: "
                    "Youth application was accepted automatically using data from VTJ"
                )
                was_email_sent = youth_application.youth_summer_voucher.send_youth_summer_voucher_email(  # noqa: E501
                    language=youth_application.language
                )
                if not was_email_sent:
                    transaction.set_rollback(True)
                    with translation.override(youth_application.language):
                        return HttpResponse(
                            _("Failed to send youth summer voucher email"),
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        )
                return HttpResponseRedirect(youth_application.accepted_page_url())
            elif youth_application.need_additional_info:
                return self._set_application_needs_additional_info(
                    youth_application=youth_application
                )

            return HttpResponseRedirect(youth_application.activated_page_url())

        return HttpResponse(
            status=status.HTTP_401_UNAUTHORIZED,
            content="Unable to activate youth application",
        )

    @staticmethod
    def _set_application_needs_additional_info(youth_application) -> HttpResponse:
        LOGGER.info(
            f"Activated youth application {youth_application.pk}: "
            "Additional info is needed, redirecting user to page to provide it"
        )
        youth_application.status = (
            YouthApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED
        )
        youth_application.save()
        return HttpResponseRedirect(
            youth_application.additional_info_page_url(pk=youth_application.pk)
        )

    @classmethod
    def error_response_with_logging(
        cls, reason: YouthApplicationRejectedReason
    ) -> JsonResponse:
        response_status = status.HTTP_400_BAD_REQUEST
        response_data = reason.json()
        LOGGER.info(
            "Youth application submission rejected. "
            f"Return HTTP status code: {response_status}. "
            f"YouthApplicationRejectedReason: {response_data.get('code')}."
        )
        return JsonResponse(status=response_status, data=response_data)

    @transaction.atomic
    def create(self, request, *args, **kwargs):  # noqa: C901
        try:
            # This function is based on CreateModelMixin class's create function.
            serializer = self.get_serializer(data=request.data, hide_vtj_data=True)
            serializer.is_valid(raise_exception=True)

            # Data is valid but let's check other criteria before creating the object
            email = serializer.validated_data["email"]
            social_security_number = serializer.validated_data["social_security_number"]

            if YouthApplication.objects.is_email_or_social_security_number_active_this_year(  # noqa: E501
                email, social_security_number
            ):
                return self.error_response_with_logging(
                    YouthApplicationRejectedReason.ALREADY_ASSIGNED
                )
            elif YouthApplication.objects.is_email_used_this_year(email):
                return self.error_response_with_logging(
                    YouthApplicationRejectedReason.EMAIL_IN_USE
                )

            # Data was valid and other criteria passed too, so let's create the object
            self.perform_create(serializer)

            # Send the localized activation/additional info request email
            youth_application = serializer.instance

            # Fetch the VTJ JSON data and save it
            youth_application.encrypted_original_vtj_json = (
                youth_application.fetch_vtj_json(end_user="")
            )
            youth_application.encrypted_handler_vtj_json = (
                youth_application.encrypted_original_vtj_json
            )
            youth_application.save(
                update_fields=[
                    "encrypted_original_vtj_json",
                    "encrypted_handler_vtj_json",
                ]
            )

            if settings.NEXT_PUBLIC_DISABLE_VTJ:
                was_email_sent = youth_application.send_activation_email(
                    request, youth_application.language
                )
            else:  # VTJ integration is enabled
                request_additional_info = serializer.validated_data.get(
                    "request_additional_information", False
                )
                if (
                    request_additional_info
                    and not youth_application.need_additional_info
                ):
                    transaction.set_rollback(True)
                    with translation.override(youth_application.language):
                        return HttpResponse(
                            _("Send anyway was used needlessly"),
                            status=status.HTTP_400_BAD_REQUEST,
                        )

                if not request_additional_info:
                    if (
                        not youth_application.is_social_security_number_valid_according_to_vtj  # noqa: E501
                        or youth_application.is_applicant_dead_according_to_vtj
                    ):
                        transaction.set_rollback(True)
                        return self.error_response_with_logging(
                            YouthApplicationRejectedReason.INADMISSIBLE_DATA
                        )
                    elif not youth_application.is_last_name_as_in_vtj:
                        transaction.set_rollback(True)
                        return self.error_response_with_logging(
                            YouthApplicationRejectedReason.PLEASE_RECHECK_DATA
                        )

                if youth_application.need_additional_info:
                    was_email_sent = (
                        youth_application.send_additional_info_request_email(
                            request, youth_application.language
                        )
                    )
                else:
                    was_email_sent = youth_application.send_activation_email(
                        request, youth_application.language
                    )

            if not was_email_sent:
                transaction.set_rollback(True)
                with translation.override(youth_application.language):
                    return HttpResponse(
                        _("Failed to send activation/additional info request email"),
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )

            # Return success creating the object
            headers = self.get_success_headers(serializer.data)
            return Response(
                data={"id": serializer.data["id"]},
                status=status.HTTP_201_CREATED,
                headers=headers,
            )
        except ValidationError as e:
            LOGGER.error(
                "Youth application submission rejected because of validation error. "
                f"Validation error codes: {str(e.get_codes())}"
            )
            raise

    @transaction.atomic
    @enforce_handler_view_adfs_login
    @action(methods=["post"], detail=False, url_path="create-without-ssn")
    def create_without_ssn(self, request, *args, **kwargs) -> HttpResponse:
        """
        Create a YouthApplication without a social security number.
        """
        try:
            data = request.data.copy()
            data["is_unlisted_school"] = True
            data["receipt_confirmed_at"] = timezone.now()
            data["additional_info_provided_at"] = timezone.now()
            data["additional_info_user_reasons"] = [AdditionalInfoUserReason.OTHER]
            data["status"] = YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED
            data["creator"] = request.user.id
            data["handler"] = None

            serializer = NonVtjYouthApplicationSerializer(
                data=data, context=self.get_serializer_context()
            )
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            app: YouthApplication = serializer.instance

            was_email_sent = app.send_processing_email_to_handler(request)
            if not was_email_sent:
                transaction.set_rollback(True)
                with translation.override(app.language):
                    return HttpResponse(
                        _("Failed to send manual processing email to handler"),
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )

            LOGGER.info(
                f"Created youth application {app.id} without social security number: "
                "Sending application to be processed by a handler"
            )

            headers = self.get_success_headers(serializer.data)
            return Response(
                data={"id": app.id},
                status=status.HTTP_201_CREATED,
                headers=headers,
            )
        except ValidationError as e:
            LOGGER.error(
                "Youth application without social security number "
                "submission rejected because of validation error. "
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

        Should inlcude only 1 application since we don't allow creation of
        multiple DRAFT applications per user & company.
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
        HandlerPermission | EmployerSummerVoucherPermission,
    ]

    def get_queryset(self):
        """
        Fetch summer vouchers of DRAFT status applications of the user &
        company.
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
        Upload a single file as attachment.
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
            Read a single attachment as file.
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
            Delete a single attachment as file.
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
