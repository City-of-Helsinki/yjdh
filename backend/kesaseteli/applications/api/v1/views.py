import logging
from functools import cached_property

from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.core import exceptions
from django.core.exceptions import PermissionDenied
from django.db import transaction
from django.db.models import F, Func
from django.db.utils import ProgrammingError
from django.http import FileResponse, HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import redirect, get_object_or_404
from django.utils import translation
from django.utils.decorators import method_decorator
from django.utils.text import format_lazy
from django.utils.translation import gettext_lazy as _
from django.views.decorators.csrf import csrf_protect
from django_filters import rest_framework as filters
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import (
    extend_schema,
    extend_schema_view,
    OpenApiParameter,
    OpenApiResponse,
)
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveAPIView, GenericAPIView
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

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
    SummerVoucherConfigurationSerializer,
    TargetGroupSerializer,
    YouthApplicationAdditionalInfoSerializer,
    YouthApplicationFetchEmployeeDataSerializer,
    YouthApplicationHandlingSerializer,
    YouthApplicationOutputSerializer,
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
    SummerVoucherConfiguration,
    YouthApplication,
    YouthSummerVoucher,
)
from applications.services import AuditAccessLogService, VTJService
from applications.target_groups import (
    AbstractTargetGroup,
    get_target_group_data,
)
from common.decorators import enforce_handler_view_adfs_login
from common.fuzzy_matching import is_last_name_fuzzy_match_in_full_name
from common.permissions import HandlerPermission
from shared.vtj.vtj_client import VTJClient

LOGGER = logging.getLogger(__name__)


@extend_schema(responses=SchoolSerializer(many=True))
class SchoolListView(ListAPIView):
    serializer_class = SchoolSerializer

    # PostgreSQL specific functionality:
    # - Custom sorter for name field to ensure finnish language sorting order.
    # - NOTE: This can be removed if the database is made to use collation fi_FI.utf8
    # TODO: Remove this after fixing related GitHub workflows to use Finnish PostgreSQL
    def get_sorter(self, field_name: str, collation: str | None) -> F | Func:
        if collation is None:
            return F(field_name)
        else:
            return Func(
                field_name,
                function=collation,
                template='(%(expressions)s) COLLATE "%(function)s"',
            )

    def get_collations(self) -> list[str | None]:
        return [
            "fi_FI.utf8",  # PostgreSQL UTF-8 version
            "Finnish_Swedish_CI_AS_UTF8",  # Azure's UTF-8 version
            "fi-FI-x-icu",  # PostgreSQL fallback
            None,  # No collation override
        ]

    def get_sorters(self) -> list[F | Func]:
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


@extend_schema(responses=TargetGroupSerializer(many=True))
class TargetGroupListView(ListAPIView):
    """
    DEPRECATED: This view is preserved for backward compatibility but is no
    longer used by the frontend. New code should use SummerVoucherConfiguration
    instead.
    """

    permission_classes = [AllowAny]
    serializer_class = TargetGroupSerializer

    def get_queryset(self) -> list[dict]:
        identifiers = [cls().identifier for cls in AbstractTargetGroup.__subclasses__()]
        return get_target_group_data(identifiers)

    def list(self, request: Request, *args, **kwargs) -> Response:
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# --- Youth Application Views ---

@extend_schema(
    request=YouthApplicationSerializer,
    responses={
        201: YouthApplicationOutputSerializer,
        400: OpenApiResponse(description="Validation rejected"),
        500: OpenApiResponse(description="Failed to send email"),
    },
)
class YouthApplicationCreateView(GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = YouthApplicationSerializer

    @staticmethod
    def error_response_with_logging(
        reason: YouthApplicationRejectedReason
    ) -> JsonResponse:
        """Return a logged 400 response with the given rejection reason."""
        response_status = status.HTTP_400_BAD_REQUEST
        response_data = reason.json()
        LOGGER.info(
            "Youth application submission rejected. "
            f"Return HTTP status code: {response_status}. "
            f"YouthApplicationRejectedReason: {response_data.get('code')}."
        )
        return JsonResponse(status=response_status, data=response_data)

    @transaction.atomic
    def post(self, request, *args, **kwargs) -> HttpResponse:
        try:
            # Validate the incoming application payload first.
            serializer = self.get_serializer(data=request.data, hide_vtj_data=True)
            serializer.is_valid(raise_exception=True)

            # Apply the business rules that sit outside serializer validation.
            email = serializer.validated_data["email"]
            social_security_number = serializer.validated_data["social_security_number"]

            if YouthApplication.objects.is_email_or_social_security_number_active_this_year(
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
            serializer.save()
            youth_application = serializer.instance

            # Fetch the VTJ JSON data and save it
            youth_application.encrypted_original_vtj_json = VTJService.fetch_vtj_json(
                youth_application, end_user=""
            )
            youth_application.encrypted_handler_vtj_json = (
                youth_application.encrypted_original_vtj_json
            )
            youth_application.update_vtj_restriction_status(
                youth_application.encrypted_original_vtj_json
            )
            youth_application.save(
                update_fields=[
                    "encrypted_original_vtj_json",
                    "encrypted_handler_vtj_json",
                    "is_vtj_data_restricted",
                ]
            )

            # Send the localized activation or additional-info email.
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
                        not youth_application.is_social_security_number_valid_according_to_vtj
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
            output_data = YouthApplicationOutputSerializer(serializer.instance).data
            return Response(output_data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            LOGGER.error(
                "Youth application submission rejected because of validation error. "
                f"Validation error codes: {str(e.get_codes())}"
            )
            raise


@extend_schema(responses=YouthApplicationSerializer)
class YouthApplicationDetailView(RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = YouthApplication.objects.all()
    serializer_class = YouthApplicationSerializer

    @transaction.atomic
    @enforce_handler_view_adfs_login
    def retrieve(self, request: Request, *args, **kwargs) -> Response | HttpResponse:
        youth_application: YouthApplication = self.get_object().lock_for_update()
        if (
            youth_application.has_social_security_number
            and not youth_application.is_handled
        ):
            youth_application.encrypted_handler_vtj_json = VTJService.fetch_vtj_json(
                youth_application, end_user=VTJClient.get_end_user(request)
            )
            youth_application.update_vtj_restriction_status(
                youth_application.encrypted_handler_vtj_json
            )
            youth_application.save(
                update_fields=["encrypted_handler_vtj_json", "is_vtj_data_restricted"]
            )
        serializer = self.get_serializer(youth_application)
        return Response(serializer.data)


class YouthApplicationCreateWithoutSsnView(GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = NonVtjYouthApplicationSerializer

    @transaction.atomic
    @enforce_handler_view_adfs_login
    @extend_schema(
        request=NonVtjYouthApplicationSerializer,
        responses={
            201: YouthApplicationOutputSerializer,
            400: OpenApiResponse(description="Validation rejected"),
            500: OpenApiResponse(description="Failed to send email"),
        },
        operation_id="create without SSN",
    )
    def post(self, request, *args, **kwargs) -> HttpResponse:
        """
        Create a YouthApplication without a social security number.

        NOTE:
            - Handles request.data conversion from QueryDict to dict to ensure
              JSONField (additional_info_user_reasons) values are handled correctly
              as lists, preventing "Invalid JSON" validation errors.
        """
        try:
            data = request.data.copy()
            if hasattr(data, "dict"):
                data = data.dict()

            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)

            # Create the application and persist its initial state.
            serializer.save()
            app: YouthApplication = serializer.instance

            # Trigger the side effect that accompanies successful creation.
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

            # Shape and return the documented success response.
            output_data = YouthApplicationOutputSerializer(app).data
            return Response(
                output_data, status=status.HTTP_201_CREATED
            )
        except ValidationError as e:
            LOGGER.error(
                "Youth application without social security number "
                "submission rejected because of validation error. "
                f"Validation error codes: {str(e.get_codes())}"
            )
            raise


@extend_schema(responses=YouthApplicationStatusSerializer)
class YouthApplicationStatusView(RetrieveAPIView):
    permission_classes = [AllowAny]
    queryset = YouthApplication.objects.all()
    serializer_class = YouthApplicationStatusSerializer



@extend_schema(
    responses={
        302: OpenApiResponse(description="Redirect to handler processing page"),
    },
)
class YouthApplicationProcessView(APIView):
    permission_classes = [AllowAny]

    @enforce_handler_view_adfs_login
    def get(self, request, *args, **kwargs) -> HttpResponse:
        youth_application = get_object_or_404(YouthApplication, pk=self.kwargs["pk"])
        return redirect(youth_application.handler_processing_url())


@extend_schema(
    request=YouthApplicationAdditionalInfoSerializer,
    responses={
        201: YouthApplicationAdditionalInfoSerializer,
        400: OpenApiResponse(description="Invalid input or status"),
        500: OpenApiResponse(description="Failed to send email"),
    },
)
class YouthApplicationAdditionalInfoView(GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = YouthApplicationAdditionalInfoSerializer
    queryset = YouthApplication.objects.all()

    @transaction.atomic
    def post(self, request, *args, **kwargs) -> HttpResponse:
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
            serializer = self.get_serializer(data=request.data)
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

            return Response(
                serializer.data, status=status.HTTP_201_CREATED
            )
        except ValidationError as e:
            LOGGER.error(
                "Youth application additional info rejected because of "
                f"validation error. Validation error codes: {str(e.get_codes())}"
            )
            raise


@method_decorator(csrf_protect, name="dispatch")
class YouthApplicationFetchEmployeeDataView(GenericAPIView):
    serializer_class = YouthApplicationFetchEmployeeDataSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    @extend_schema(
        request=YouthApplicationFetchEmployeeDataSerializer,
        responses={
            200: YouthApplicationFetchEmployeeDataSerializer,
            400: OpenApiResponse(description="Bad request"),
            403: OpenApiResponse(description="Forbidden"),
            404: OpenApiResponse(description="Employee not found"),
        },
        operation_id="fetch employee data",
    )
    def post(self, request, *args, **kwargs) -> HttpResponse:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data

        employer_voucher = self._get_employer_voucher(
            validated["employer_summer_voucher_id"]
        )
        if not employer_voucher:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        youth_app, youth_voucher = self._resolve_and_match_youth_app(
            validated["summer_voucher_serial_number"], validated["employee_name"]
        )

        audit_params = {
            "employer_summer_voucher_id": str(employer_voucher.id),
            "employee_name": validated["employee_name"],
            "summer_voucher_serial_number": validated["summer_voucher_serial_number"],
        }

        if not youth_app:
            self._log_audit_access(request, None, audit_params)
            LOGGER.warning(
                f"No match for employee name {validated['employee_name']} with voucher"
                f" {validated['summer_voucher_serial_number']} in YouthApplication None"
                f" - Cannot set employee data."
            )
            return Response(status=status.HTTP_404_NOT_FOUND)

        error_code = self._check_voucher_business_rules(
            youth_app, youth_voucher, employer_voucher
        )
        if error_code:
            LOGGER.warning(
                f"YouthApplication {youth_app.pk} check failed: {error_code}"
                f" - Cannot set employee data."
            )
            return Response(
                data={"error_code": error_code}, status=status.HTTP_400_BAD_REQUEST
            )

        self._log_audit_access(request, youth_app, audit_params)
        
        response_data = {
            "employer_summer_voucher_id": employer_voucher.id,
            "employee_name": youth_app.name,
            "employee_birthdate": youth_app.birthdate,
            "employee_phone_number": youth_app.phone_number,
            "employee_home_city": youth_app.home_municipality,
            "employee_postcode": youth_app.postcode,
            "employee_school": youth_app.school,
        }
        response_serializer = self.serializer_class(data=response_data)
        try:
            response_serializer.is_valid(raise_exception=True)
        except ValidationError as exc:
            LOGGER.exception(
                "Invalid fetch_employee_data response for YouthApplication %s: %s",
                youth_app.pk,
                exc.detail,
            )
            from rest_framework.exceptions import APIException
            raise APIException("Invalid employee lookup response data") from exc

        return Response(response_serializer.data, status=status.HTTP_200_OK)

    def _get_employer_voucher(self, voucher_id) -> EmployerSummerVoucher | None:
        return EmployerSummerVoucher.objects.filter(id=voucher_id).first()

    def _resolve_and_match_youth_app(
        self, serial, name
    ) -> tuple[YouthApplication | None, YouthSummerVoucher | None]:
        youth_voucher = YouthSummerVoucher.objects.get_by_serial_number(serial)
        youth_app = youth_voucher.youth_application if youth_voucher else None

        if youth_app and is_last_name_fuzzy_match_in_full_name(
            last_name=youth_app.last_name, full_name=name
        ):
            return youth_app, youth_voucher
        return None, None

    def _check_voucher_business_rules(
        self, app, youth_voucher, employer_voucher
    ) -> str | None:
        if app.status != YouthApplicationStatus.ACCEPTED:
            return "youth_application_not_accepted"

        already_used = (
            EmployerSummerVoucher.objects.filter(youth_summer_voucher=youth_voucher)
            .exclude(application__id=employer_voucher.application_id)
            .exists()
        )

        if already_used:
            return "summer_voucher_already_used"
        return None

    def _log_audit_access(self, request, accessed_instance, parameters):
        audit_data = {
            "method": "YouthApplicationViewSet.fetch_employee_data",
            "parameters": parameters,
        }
        if accessed_instance:
            AuditAccessLogService.create_access_log_entry_with_related_object_and_additional_data(
                accessed_instance=accessed_instance,
                actor=request.user,
                actor_email=request.user.email,
                additional_data=audit_data,
            )
        else:
            AuditAccessLogService.create_access_log_entry_with_no_related_object_instance(
                actor=request.user,
                actor_email=request.user.email,
                content_type=ContentType.objects.get_for_model(YouthApplication),
                additional_data=audit_data,
            )


@extend_schema(
    request=YouthApplicationHandlingSerializer,
    responses={
        200: OpenApiResponse(description="Application accepted"),
        400: OpenApiResponse(description="Application was not accepted"),
    },
)
class YouthApplicationAcceptView(GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = YouthApplicationHandlingSerializer
    queryset = YouthApplication.objects.all()

    @transaction.atomic
    @enforce_handler_view_adfs_login
    def patch(self, request, *args, **kwargs) -> HttpResponse:
        youth_application: YouthApplication = self.get_object().lock_for_update()

        if (
            settings.NEXT_PUBLIC_DISABLE_VTJ
            or not youth_application.has_social_security_number
        ):
            encrypted_handler_vtj_json = None
        else:
            try:
                serializer = self.get_serializer(data=request.data)
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
            return HttpResponse(status=status.HTTP_200_OK)
        else:
            return HttpResponse(status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    request=YouthApplicationHandlingSerializer,
    responses={
        200: OpenApiResponse(description="Application rejected"),
        400: OpenApiResponse(description="Application was not rejected"),
    },
)
class YouthApplicationRejectView(GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = YouthApplicationHandlingSerializer
    queryset = YouthApplication.objects.all()

    @transaction.atomic
    @enforce_handler_view_adfs_login
    def patch(self, request, *args, **kwargs) -> HttpResponse:
        youth_application: YouthApplication = self.get_object().lock_for_update()

        if (
            settings.NEXT_PUBLIC_DISABLE_VTJ
            or not youth_application.has_social_security_number
        ):
            encrypted_handler_vtj_json = None
        else:
            try:
                serializer = self.get_serializer(data=request.data)
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
            return HttpResponse(status=status.HTTP_200_OK)
        else:
            return HttpResponse(status=status.HTTP_400_BAD_REQUEST)


class YouthApplicationActivateView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    @extend_schema(
        responses={
            302: OpenApiResponse(
                description="Redirect to the relevant application status page"
            ),
            401: OpenApiResponse(description="Unable to activate application"),
            500: OpenApiResponse(description="Failed to send email"),
        },
        operation_id="activate youth application",
        summary="Activate youth application",
        description="Activate youth application and send email with summer voucher.",
    )
    def get(self, request, *args, **kwargs) -> HttpResponse:
        youth_application = get_object_or_404(YouthApplication, pk=self.kwargs["pk"])

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
                was_email_sent = youth_application.youth_summer_voucher.send_youth_summer_voucher_email(
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
    def _set_application_needs_additional_info(
        youth_application: YouthApplication,
    ) -> HttpResponse:
        """Move the application into the additional-info flow and redirect."""
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



class EmployerApplicationFilter(filters.FilterSet):
    """
    Filtering & sorting support for EmployerApplicationViewSet
    """

    only_mine = filters.BooleanFilter(method="filter_only_mine")
    status = filters.MultipleChoiceFilter(choices=EmployerApplicationStatus.choices)
    created_at = filters.DateTimeFromToRangeFilter()
    modified_at = filters.DateTimeFromToRangeFilter()
    ordering = filters.OrderingFilter(
        # (Model field name, parameter name) tuples:
        fields=[
            # Present model field names directly as the query parameters:
            (field_name, field_name)
            for field_name in [
                "company__business_id",
                "company__name",
                "company_id",
                "created_at",
                "id",
                "modified_at",
                "status",
                "user__first_name",
                "user__last_name",
                "user_id",
            ]
        ]
    )

    def _filter_by_user(self, queryset):
        """
        Filter queryset by the current user, if they're authenticated,
        otherwise return empty queryset.
        """
        user = self.request.user
        if user and user.is_authenticated:
            return queryset.filter(user=user)
        return queryset.none()

    def filter_only_mine(self, queryset, name, value):
        """
        Filter to show only current user's employer applications
        """
        if value:
            return self._filter_by_user(queryset)
        return queryset

    class Meta:
        model = EmployerApplication
        _timestamp_field_lookups = [
            f"{prefix}{filter}"
            for prefix in ["", "year__", "date__"]
            for filter in ["gte", "lte", "gt", "lt", "exact"]
        ]
        fields = {
            "company__business_id": ["exact", "in"],
            "company_id": ["exact", "in"],
            "created_at": _timestamp_field_lookups,
            "modified_at": _timestamp_field_lookups,
            "status": ["exact", "in"],
            "user_id": ["exact", "in"],
        }


class EmployerApplicationViewSet(ModelViewSet):
    queryset = EmployerApplication.objects.all()
    serializer_class = EmployerApplicationSerializer
    permission_classes = [IsAuthenticated, EmployerApplicationPermission]
    pagination_class = LimitOffsetPagination
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = EmployerApplicationFilter

    def get_queryset(self):
        queryset = (
            super()
            .get_queryset()
            .select_related("company")
            .select_related("user")
            .prefetch_related("summer_vouchers")
        )

        user = self.request.user

        if user.is_anonymous:
            return queryset.none()

        if user.is_staff or user.is_superuser:
            return queryset

        # Ensure that visibility is strictly tied to the organization the user
        # currently represents. If the user does not represent an organization
        # (e.g., lost permissions), they should not see any applications,
        # even if they were the creator of some.
        user_company = get_user_company(self.request)

        if user_company:
            return queryset.filter(
                company=user_company,
                status__in=ALLOWED_APPLICATION_VIEW_STATUSES,
            )

        # User is not staff, superuser or company user (not representing any company)
        # Should not be able to see any applications
        LOGGER.warning(
            f"User {user.id} is not staff, superuser or company user "
            "(not representing any company)."
        )
        return queryset.none()

    def create(self, request: Request, *args, **kwargs) -> Response:
        """
        Allow only 1 (DRAFT) application per user & company.
        """
        if (
            self.get_queryset()
            .filter(status=EmployerApplicationStatus.DRAFT, user=request.user)
            .exists()
        ):
            raise ValidationError("Company & user can have only one draft application")

        return super().create(request, *args, **kwargs)

    def update(self, request: Request, *args, **kwargs) -> Response:
        """
        Allow to update only DRAFT status applications.
        """
        instance = self.get_object()
        if instance.status not in ALLOWED_APPLICATION_UPDATE_STATUSES:
            raise ValidationError("Only DRAFT applications can be updated")

        # Ensure that visibility and modification are strictly tied to the
        # organization the user currently represents. Even the original creator
        # must have an active organization association to update the application.
        user_company = get_user_company(request)
        if not user_company or instance.company != user_company:
            raise PermissionDenied("Only company members can update it")

        return super().update(request, *args, **kwargs)

    def destroy(self, request: Request, *args, **kwargs) -> Response:
        """
        Allow to delete only DRAFT status applications.
        """
        instance = self.get_object()
        if instance.status not in ALLOWED_APPLICATION_UPDATE_STATUSES:
            raise ValidationError("Only DRAFT applications can be deleted")

        # Ensure that visibility and modification are strictly tied to the
        # organization the user currently represents. Even the original creator
        # must have an active organization association to delete the application.
        user_company = get_user_company(request)
        if not user_company or instance.company != user_company:
            raise PermissionDenied("Only company members can delete it")

        return super().destroy(request, *args, **kwargs)


# --- Employer Summer Voucher Attachment Views ---

@extend_schema(
    responses={
        201: AttachmentSerializer,
        400: OpenApiResponse(description="Invalid input"),
        403: OpenApiResponse(description="Forbidden"),
        404: OpenApiResponse(description="Voucher not found"),
    },
)
class EmployerSummerVoucherAttachmentView(CreateAPIView):
    serializer_class = AttachmentSerializer
    permission_classes = [IsAuthenticated, EmployerSummerVoucherPermission]
    parser_classes = (MultiPartParser,)

    def get_queryset(self):
        queryset = EmployerSummerVoucher.objects.all()
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return queryset
        elif user.is_anonymous:
            return queryset.none()

        user_company = get_user_company(self.request)
        if user_company:
            return queryset.filter(
                application__company=user_company,
                application__status__in=ALLOWED_APPLICATION_VIEW_STATUSES,
            )
        return queryset.none()

    def create(self, request, *args, **kwargs):
        summer_voucher = get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])

        if summer_voucher.application.status not in ALLOWED_APPLICATION_UPDATE_STATUSES:
            raise ValidationError(
                "Attachments can be uploaded only for DRAFT applications"
            )

        user_company = get_user_company(request)
        if not user_company or summer_voucher.application.company != user_company:
            raise PermissionDenied("Only company members can post attachment to it")

        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        summer_voucher = get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])
        serializer.save(
            summer_voucher=summer_voucher,
            content_type=self.request.data["attachment_file"].content_type,
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        summer_voucher = get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])
        context["summer_voucher"] = summer_voucher
        return context


@extend_schema(
    parameters=[
        OpenApiParameter(
            name="attachment_pk",
            type=OpenApiTypes.UUID,
            location=OpenApiParameter.PATH,
            description="A UUID string identifying this attachment.",
        ),
    ],
    responses={
        200: OpenApiTypes.BINARY,
        204: OpenApiResponse(description="Attachment deleted"),
        404: OpenApiResponse(description="File not found"),
    },
)
class EmployerSummerVoucherAttachmentDetailView(APIView):
    permission_classes = [
        IsAuthenticated,
        HandlerPermission | EmployerSummerVoucherPermission,
    ]

    def get(self, request: Request, pk: str, attachment_pk: str, *args, **kwargs) -> HttpResponse | Response:
        """Download a single attachment identified by its UUID."""
        summer_voucher = get_object_or_404(EmployerSummerVoucher, pk=pk)

        user = request.user
        if not (user.is_staff or user.is_superuser):
            user_company = get_user_company(request)
            if not user_company or summer_voucher.application.company != user_company:
                return Response(status=status.HTTP_404_NOT_FOUND)
            if summer_voucher.application.status not in ALLOWED_APPLICATION_VIEW_STATUSES:
                return Response(status=status.HTTP_404_NOT_FOUND)

        attachment = summer_voucher.attachments.filter(pk=attachment_pk).first()
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

    def delete(self, request: Request, pk: str, attachment_pk: str, *args, **kwargs) -> Response:
        """Delete a single attachment identified by its UUID."""
        summer_voucher = get_object_or_404(EmployerSummerVoucher, pk=pk)

        user = request.user
        if not (user.is_staff or user.is_superuser):
            user_company = get_user_company(request)
            if not user_company or summer_voucher.application.company != user_company:
                return Response(status=status.HTTP_404_NOT_FOUND)
            if summer_voucher.application.status not in ALLOWED_APPLICATION_VIEW_STATUSES:
                return Response(status=status.HTTP_404_NOT_FOUND)

        user_company = get_user_company(request)
        if not user_company or summer_voucher.application.company != user_company:
            raise PermissionDenied("Only company members can delete attachment from it")

        if (
            summer_voucher.application.status
            not in AttachmentSerializer.ATTACHMENT_MODIFICATION_ALLOWED_STATUSES
        ):
            raise PermissionDenied(
                "Operation not allowed for this application status."
            )

        try:
            instance = summer_voucher.attachments.get(id=attachment_pk)
        except exceptions.ObjectDoesNotExist:
            return Response(
                {"detail": _("File not found.")}, status=status.HTTP_404_NOT_FOUND
            )
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema(responses=SummerVoucherConfigurationSerializer(many=True))
class SummerVoucherConfigurationViewSet(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = SummerVoucherConfigurationSerializer
    queryset = SummerVoucherConfiguration.objects.all()

    def get_queryset(self):
        # We only want to return configuration for current and future years, or all.
        # But commonly we just want to expose all configs so frontend can handle logic.
        return super().get_queryset()
