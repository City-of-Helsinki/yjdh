import enum

from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from django.utils import timezone
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
    TALPA_INVOICEABLE_STATUSES,
    TalpaApiKeyPermission,
    TalpaBasicAuthPermission,
)
from applications.enums import EmployerApplicationStatus
from applications.models import (
    EmployerApplication,
    EmployerSummerVoucher,
    TimelineActivityLog,
)
from applications.services import AuditAccessLogService


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


class VoucherClassification(enum.Enum):
    """Result of classifying a voucher in a Talpa webhook batch."""

    VALID = "valid"
    UNINVOICEABLE = "uninvoiceable"
    CONFLICT = "conflict"


@extend_schema(tags=["talpa-integration"])
class TalpaWebhookView(APIView):
    """
    Bulk-acknowledge endpoint for the Talpa invoicing integration.

    Talpa calls this endpoint after it has successfully imported a batch of
    employer summer vouchers into its invoicing system.  The view marks every
    identified voucher as invoiced by setting ``invoiced_at``, ``is_exported``
    and ``talpa_request_id`` in a single SQL UPDATE.

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

    def _classify_voucher(
        self,
        voucher: EmployerSummerVoucher,
        request_id: str,
    ) -> VoucherClassification:
        """Classify a single voucher as uninvoiceable, conflict, or valid.

        Args:
            voucher: The locked voucher instance (with ``application`` pre-fetched).
            request_id: The Talpa request ID, used to identify idempotent retries.

        Returns:
            ``VoucherClassification.UNINVOICEABLE`` if the voucher cannot be invoiced,
            ``VoucherClassification.CONFLICT`` if it was invoiced by a
            different request, or ``VoucherClassification.VALID`` if the
            voucher is valid (including idempotent retries).
        """
        if voucher.invoiced_at is not None:
            # Already invoiced by a different request — conflict.
            # If it's the SAME request, it's an idempotent retry (no conflict).
            if voucher.talpa_request_id != request_id:
                return VoucherClassification.CONFLICT
            return VoucherClassification.VALID

        app_status = voucher.application.status
        if app_status not in TALPA_INVOICEABLE_STATUSES:
            # Idempotent retry: same request already failed this voucher.
            # Accept it so the caller is not forced to split the batch.
            if (
                app_status == EmployerApplicationStatus.ERROR_IN_PAYMENT
                and request_id
                and voucher.talpa_request_id == request_id
            ):
                # Same-request retry on ERROR_IN_PAYMENT — accept silently
                return VoucherClassification.VALID
            return VoucherClassification.UNINVOICEABLE

        return VoucherClassification.VALID

    def _validate_and_lock_vouchers(self, voucher_ids: set, request_id: str) -> dict:
        """
        Lock vouchers for update and validate they can transition to invoiced.

        Args:
            voucher_ids: A set of UUIDs to check and lock.
            request_id: The Talpa request ID, used to identify idempotent retries.

        Returns:
            A dictionary of errors (e.g. unknown_ids, uninvoiceable_ids, conflict_ids).
            If empty, the batch is valid and locked.
        """
        # Fetch with select_for_update to lock rows and prevent race conditions.
        # select_related application is needed to check status without extra queries.
        vouchers = (
            EmployerSummerVoucher.objects.select_for_update(of=("self", "application"))
            .select_related("application")
            .filter(pk__in=voucher_ids)
        )
        found_ids = {v.pk for v in vouchers}

        errors = {}
        unknown_ids = voucher_ids - found_ids
        if unknown_ids:
            errors["unknown_ids"] = [str(i) for i in unknown_ids]

        uninvoiceable_ids = []
        conflict_ids = []

        for v in vouchers:
            classification = self._classify_voucher(v, request_id)
            if classification == VoucherClassification.UNINVOICEABLE:
                uninvoiceable_ids.append(str(v.pk))
            elif classification == VoucherClassification.CONFLICT:
                conflict_ids.append(str(v.pk))

        if uninvoiceable_ids:
            errors["uninvoiceable_ids"] = uninvoiceable_ids
        if conflict_ids:
            errors["conflict_ids"] = conflict_ids

        return errors

    def _mark_vouchers_as_invoiced(self, voucher_ids: set, request_id: str) -> int:
        """
        Mark a set of vouchers as invoiced and exported.

        This uses QuerySet.update() which bypasses Django signals. See
        TalpaIntegrationMixin docstring for the audit logging rationale.

        Args:
            voucher_ids: A set of UUIDs representing the vouchers to update.
            request_id: The Talpa request ID to record.

        Returns:
            The number of rows matched by the update query
            (excluding idempotent retries).
        """
        return EmployerSummerVoucher.objects.filter(
            pk__in=voucher_ids,
            invoiced_at__isnull=True,
            application__status__in=TALPA_INVOICEABLE_STATUSES,
        ).update(
            invoiced_at=timezone.now(),
            talpa_request_id=request_id,
            is_exported=True,
        )

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
        4. If all IDs are valid, update those vouchers to mark them as invoiced.
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

        if successful_ids & failed_ids:
            return Response(
                {"overlapping_ids": [str(i) for i in successful_ids & failed_ids]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        all_ids = successful_ids | failed_ids

        with transaction.atomic():
            errors = self._validate_and_lock_vouchers(all_ids, request_id)
            if errors:
                return Response(errors, status=status.HTTP_400_BAD_REQUEST)

            updated = self._mark_vouchers_as_invoiced(successful_ids, request_id)

            if successful_ids:
                self._handle_successful_vouchers(successful_ids, request_id)

            if failed_ids:
                self._handle_failed_vouchers(failed_ids, request_id)

        return Response({"updated": updated}, status=status.HTTP_200_OK)

    def _handle_failed_vouchers(self, voucher_ids: set, request_id: str) -> int:
        """
        Mark applications for the given voucher IDs as ERROR_IN_PAYMENT.

        Transitions the EmployerApplication status to ERROR_IN_PAYMENT
        and creates a TimelineActivityLog entry for each affected application.
        """
        # Audit log entry so the event is always recorded
        AuditAccessLogService.create_access_log_entry_with_no_related_object_instance(
            actor=None,
            actor_email="talpa-system",
            content_type=ContentType.objects.get_for_model(EmployerSummerVoucher),
            additional_data={
                "method": f"{self.__class__.__name__}._handle_failed_vouchers",
                "ids": [str(i) for i in voucher_ids],
                "request_id": request_id,
            },
        )

        # Persist the request_id on voucher rows so that _validate_and_lock_vouchers
        # can identify same-request retries on ERROR_IN_PAYMENT vouchers.
        EmployerSummerVoucher.objects.filter(pk__in=voucher_ids).update(
            talpa_request_id=request_id
        )

        apps_to_update = (
            EmployerApplication.objects.filter(summer_vouchers__id__in=voucher_ids)
            .exclude(status=EmployerApplicationStatus.ERROR_IN_PAYMENT)
            .distinct()
        )

        app_records = list(apps_to_update.values_list("id", "status"))

        if not app_records:
            return 0

        TimelineActivityLog.objects.bulk_create(
            [
                TimelineActivityLog(
                    application_id=app_id,
                    application_type="employerapplication",
                    from_status=old_status,
                    to_status=EmployerApplicationStatus.ERROR_IN_PAYMENT,
                )
                for app_id, old_status in app_records
            ]
        )

        return apps_to_update.update(status=EmployerApplicationStatus.ERROR_IN_PAYMENT)

    def _handle_successful_vouchers(self, voucher_ids: set, request_id: str) -> int:
        """
        Transition applications for the given voucher IDs to RECEIVED_BY_PAYMENT_SYSTEM.

        Creates TimelineActivityLog entries for each affected application.
        Skips applications already in RECEIVED_BY_PAYMENT_SYSTEM (idempotent).
        """
        apps_to_update = (
            EmployerApplication.objects.filter(summer_vouchers__id__in=voucher_ids)
            .exclude(status=EmployerApplicationStatus.RECEIVED_BY_PAYMENT_SYSTEM)
            .distinct()
        )
        app_records = list(apps_to_update.values_list("id", "status"))
        if not app_records:
            return 0

        TimelineActivityLog.objects.bulk_create(
            [
                TimelineActivityLog(
                    application_id=app_id,
                    application_type="employerapplication",
                    from_status=old_status,
                    to_status=EmployerApplicationStatus.RECEIVED_BY_PAYMENT_SYSTEM,
                )
                for app_id, old_status in app_records
            ]
        )
        return apps_to_update.update(
            status=EmployerApplicationStatus.RECEIVED_BY_PAYMENT_SYSTEM
        )
