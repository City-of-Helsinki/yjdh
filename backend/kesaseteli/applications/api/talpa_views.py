from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers, status
from rest_framework.generics import ListAPIView
from rest_framework.pagination import CursorPagination
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from applications.api.authentications import TalpaRobotBasicAuthentication
from applications.api.integration_filters import IntegrationExportFilterSet
from applications.api.integration_serializers import TalpaExportSerializer
from applications.api.integration_views import (
    TalpaApiKeyPermission,
    TalpaBasicAuthPermission,
)
from applications.models import (
    EmployerSummerVoucher,
)
from applications.services import AuditAccessLogService, TalpaWebhookService


class TalpaExportFilterSet(IntegrationExportFilterSet):
    pass


class TalpaCursorPagination(CursorPagination):
    ordering = ("_submitted_at", "created_at", "pk")
    page_size = 100
    page_size_query_param = "limit"
    max_page_size = 1000


@extend_schema(tags=["talpa-integration"])
class TalpaExportView(ListAPIView):
    """
    JSON Export endpoint for Talpa integration.
    """

    permission_classes = [TalpaApiKeyPermission | TalpaBasicAuthPermission]
    authentication_classes = [TalpaRobotBasicAuthentication]
    pagination_class = TalpaCursorPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = TalpaExportFilterSet
    serializer_class = TalpaExportSerializer

    def get_queryset(self):
        from django.db.models import F

        return (
            EmployerSummerVoucher.objects.unhandled()
            .for_export()
            .annotate(_submitted_at=F("application__submitted_at"))
        )


class TalpaWebhookInputSerializer(serializers.Serializer):
    successful_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        default=list,
    )
    failed_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        default=list,
        help_text=(
            "Optional list of voucher UUIDs that Talpa failed to process. "
            "Applications for these vouchers will be transitioned to "
            "ERROR_IN_PAYMENT status."
        ),
    )
    request_id = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=255,
        default="",
        help_text=(
            "Optional unique request ID provided by Talpa to track this batch "
            "of invoices. When provided, enables idempotent retries: calling the "
            "webhook again with the same request_id for already-invoiced vouchers "
            "will succeed (not conflict). When omitted, idempotency checking is "
            "skipped."
        ),
    )

    def validate(self, attrs):
        successful_ids = attrs.get("successful_ids", [])
        failed_ids = attrs.get("failed_ids", [])
        if not successful_ids and not failed_ids:
            raise serializers.ValidationError(
                "Either 'successful_ids' or 'failed_ids' must not be empty."
            )
        return attrs


@extend_schema(tags=["talpa-integration"])
class TalpaWebhookView(APIView):
    """
    Bulk-acknowledge endpoint for the Talpa invoicing integration.

    Talpa calls this endpoint after it has processed a batch of employer summer
    vouchers. The view marks successfully processed vouchers as invoiced by
    setting ``invoiced_at``, ``is_exported`` and ``talpa_request_id``. Failed
    vouchers are recorded with their ``talpa_request_id``, and their respective
    applications are transitioned to the ``ERROR_IN_PAYMENT`` status.

    Audit logging
    -------------
    ``QuerySet.update()`` bypasses Django's ``post_save`` signal, so
    ``django-auditlog`` will NOT generate per-row UPDATE log entries for this
    operation — this is the same known trade-off accepted by the Excel export's
    ``queryset_with_pks.order_by().update(is_exported=True)`` call in
    ``employer_excel_export.py``.

    To compensate, this view writes an explicit ACCESS log entry (via
    ``AuditAccessLogService``) *before* the update.  That entry records:
    - ``actor_email="talpa-system"`` as a stable, recognisable system actor
    - the full list of voucher IDs and the ``request_id`` in ``additional_data``

    This gives auditors a complete, searchable record of what Talpa sent and
    when, even though no per-row UPDATE entries exist in the audit trail.
    """

    permission_classes = [TalpaApiKeyPermission | TalpaBasicAuthPermission]
    authentication_classes = [TalpaRobotBasicAuthentication]
    http_method_names = ["post"]

    @extend_schema(
        summary="Acknowledge batch receipt (Webhook)",
        description=(
            "This webhook MUST be called by the Talpa invoicing system "
            "immediately after successfully processing a batch of employer "
            "summer vouchers fetched from the `/v1/talpa/export/` endpoint.\n\n"
            "**Purpose:**\n"
            "Calling this endpoint acknowledges receipt of the vouchers and "
            "marks them as invoiced in the Kesäseteli backend. This guarantees "
            "that these vouchers will **not** appear in future `/v1/talpa/export/` "
            "payloads.\n\n"
            "If failures occurred, provide them in `failed_ids` to transition "
            "the corresponding vouchers to the `ERROR_IN_PAYMENT` status.\n\n"
            "**Important:**\n"
            "If Talpa downloads a batch but fails to call this webhook, the "
            "same vouchers will be returned in the next export batch, "
            "potentially leading to duplicate invoices in the financial system.\n\n"
            "**Idempotency:**\n"
            "If a `request_id` is provided, calling this endpoint multiple times "
            "with the same `request_id` is safe and will not result in a conflict."
        ),
        request=TalpaWebhookInputSerializer,
        responses={
            status.HTTP_200_OK: inline_serializer(
                name="TalpaWebhookSuccessResponse",
                fields={
                    "updated": serializers.IntegerField(
                        help_text="Number of vouchers newly marked as invoiced."
                    )
                },
            ),
            status.HTTP_400_BAD_REQUEST: inline_serializer(
                name="TalpaWebhookErrorResponse",
                fields={
                    "overlapping_ids": serializers.ListField(
                        child=serializers.UUIDField(),
                        required=False,
                        help_text=(
                            "List of UUIDs present in both 'successful_ids' "
                            "and 'failed_ids'."
                        ),
                    ),
                    "unknown_ids": serializers.ListField(
                        child=serializers.UUIDField(),
                        required=False,
                        help_text=(
                            "List of UUIDs that were not found in the "
                            "Kesäseteli system."
                        ),
                    ),
                    "uninvoiceable_ids": serializers.ListField(
                        child=serializers.UUIDField(),
                        required=False,
                        help_text="List of UUIDs for vouchers not in SUBMITTED state.",
                    ),
                    "conflict_ids": serializers.ListField(
                        child=serializers.UUIDField(),
                        required=False,
                        help_text=(
                            "List of UUIDs for vouchers already invoiced "
                            "by another request."
                        ),
                    ),
                },
            ),
        },
    )
    def post(self, request: Request) -> Response:
        """
        Process the webhook callback from the Talpa invoicing system.

        This method is called by the Talpa robot after it has successfully processed
        a batch of employer summer vouchers.

        The workflow is as follows:
        1. Validate that the request contains a list of voucher UUIDs and an
           optional request ID.
        2. Write an unconditional Audit Access Log entry recording the full
           incoming payload (IDs + request_id). This entry is persisted even if
           the request ultimately returns 400 — the intent is to record exactly
           what Talpa sent, regardless of outcome.
        3. Inside an atomic transaction, verify that every provided voucher ID
           exists in the database and can be transitioned to invoiced. If any
           IDs fail validation, abort the transaction and return a 400 Bad Request.
        4. If all IDs are valid, mark successful vouchers as invoiced, persist the
           request ID on failed vouchers, and update the application statuses.
        5. Return a 200 OK response with the count of successfully updated vouchers.
        """
        serializer = TalpaWebhookInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        request_id = data["request_id"]

        successful_ids = set(data.get("successful_ids", []))
        failed_ids = set(data.get("failed_ids", []))

        # Explicit ACCESS entry — the only audit trace for a bulk update.
        # Quick recap: QuerySet.update() bypasses Django's post_save signals,
        # so django-auditlog cannot generate proper per-row UPDATE logs.
        # See TalpaIntegrationMixin docstring for full rationale.
        AuditAccessLogService.create_access_log_entry_with_no_related_object_instance(
            actor=None,
            actor_email="talpa-system",
            content_type=ContentType.objects.get_for_model(EmployerSummerVoucher),
            additional_data={
                "method": f"{self.__class__.__name__}.post",
                "successful_ids": [str(i) for i in successful_ids],
                "failed_ids": [str(i) for i in failed_ids],
                "request_id": request_id,
            },
        )

        service = TalpaWebhookService(successful_ids, failed_ids, request_id)

        if service.has_overlapping_ids():
            return Response(
                {"overlapping_ids": [str(i) for i in service.get_overlapping_ids()]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            errors = service.validate_and_lock_vouchers()
            if errors:
                return Response(errors, status=status.HTTP_400_BAD_REQUEST)

            updated = service.process_batch()

        return Response({"updated": updated}, status=status.HTTP_200_OK)
