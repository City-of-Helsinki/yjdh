from applications.api.v1.serializers import (
    ApplicantApplicationSerializer,
    AttachmentSerializer,
    HandlerApplicationSerializer,
)
from applications.enums import ApplicationBatchStatus, ApplicationStatus
from applications.models import Application, ApplicationBatch
from applications.services.applications_csv_report import ApplicationsCsvService
from common.permissions import BFIsApplicant, BFIsHandler, TermsOfServiceAccepted
from django.conf import settings
from django.core import exceptions
from django.db import transaction
from django.db.models import Q
from django.http import FileResponse, StreamingHttpResponse
from django.utils import timezone
from django.utils.text import format_lazy
from django.utils.translation import gettext_lazy as _
from django_filters import DateFromToRangeFilter, rest_framework as filters
from django_filters.widgets import CSVWidget
from drf_spectacular.utils import extend_schema
from messages.models import MessageType
from rest_framework import filters as drf_filters, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from sql_util.aggregates import SubqueryCount
from users.utils import get_company_from_request

from shared.audit_log.viewsets import AuditLoggingModelViewSet


class BaseApplicationFilter(filters.FilterSet):

    status = filters.MultipleChoiceFilter(
        field_name="status",
        widget=CSVWidget,
        choices=ApplicationStatus.choices,
        help_text=(
            "Filter by application status."
            " Multiple statuses may be specified as a comma-separated list, such as 'status=draft,received'",
        ),
    )


class ApplicantApplicationFilter(BaseApplicationFilter):
    class Meta:
        model = Application
        fields = {
            "employee__social_security_number": ["exact"],
            "company__business_id": ["exact"],
            "benefit_type": ["exact"],
            "company_name": ["iexact", "icontains"],
            "employee__first_name": ["iexact", "icontains"],
            "employee__last_name": ["iexact", "icontains"],
        }


class HandlerApplicationFilter(BaseApplicationFilter):

    # the date when application was last set to either REJECTED, ACCEPTED or CANCELLED status
    handled_at = DateFromToRangeFilter(method="filter_handled_at")

    def filter_handled_at(self, queryset, name, value):
        assert value.step is None, "Should not happen"
        if value.start and value.stop:
            filter_kw = {"handled_at__range": (value.start, value.stop)}
        elif value.start:
            filter_kw = {"handled_at__gte": value.start}
        elif value.stop:
            filter_kw = {"handled_at__lte": value.stop}
        else:
            # no filtering, so skip the annotation query
            return queryset
        return queryset.filter(
            status__in=HandlerApplicationViewSet.HANDLED_STATUSES, **filter_kw
        )

    class Meta:
        model = Application
        fields = {
            "batch": ["exact", "isnull"],
            "archived": ["exact"],
            "employee__social_security_number": ["exact"],
            "company__business_id": ["exact"],
            "benefit_type": ["exact"],
            "company_name": ["iexact", "icontains"],
            "employee__first_name": ["iexact", "icontains"],
            "employee__last_name": ["iexact", "icontains"],
            "start_date": ["lt", "lte", "gt", "gte", "exact"],
            "end_date": ["lt", "lte", "gt", "gte", "exact"],
        }


class BaseApplicationViewSet(AuditLoggingModelViewSet):
    filter_backends = [
        drf_filters.OrderingFilter,
        filters.DjangoFilterBackend,
        drf_filters.SearchFilter,
    ]
    search_fields = ["company_name", "company_contact_person_email"]

    def get_queryset(self):
        user = self.request.user
        # FIXME: Remove DISABLE_AUTHENTICATION line when FE implemented authentication
        if not settings.DISABLE_AUTHENTICATION:
            if not user.is_authenticated:
                return Application.objects.none()
        qs = Application.objects.all().select_related("company", "employee")
        return qs

    EXCLUDE_FIELDS_FROM_SIMPLE_LIST = [
        "applicant_terms_approval",
        "bases",
        "attachment_requirements",
        "applicant_terms_approval_needed",
        "applicant_terms_in_effect",
        "former_benefit_info",
        "available_benefit_types",
        "status_last_changed_at",
        "ahjo_decision",
        "latest_decision_comment",
        "training_compensations",
        "pay_subsidies",
        "warnings",
        "attachments",
        "de_minimis_aid_set",
    ]

    def perform_update(self, serializer):
        super().perform_update(serializer)
        # In case new AuditLogEntry objects were created during the
        # processing of the update, then the annotation value for handled_at
        # in the serializer.instance might have become stale.
        # Update the object.
        serializer.instance = self.get_queryset().get(pk=serializer.instance.pk)

    @action(methods=["get"], detail=False, url_path="simplified_list")
    def simplified_application_list(self, request):
        """
        Convenience action for the frontends that by default excludes the fields that are not normally
        needed in application listing pages.
        """
        qs = self.filter_queryset(self.get_queryset())
        context = self.get_serializer_context()
        fields = set(context.get("fields", []))
        exclude_fields = set(context.get("exclude_fields", []))
        extra_exclude_fields = set(self.EXCLUDE_FIELDS_FROM_SIMPLE_LIST)
        context["exclude_fields"] = list(
            exclude_fields | (extra_exclude_fields - fields)
        )

        serializer = self.serializer_class(qs, many=True, context=context)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(
        methods=("POST",),
        detail=True,
        url_path="attachments",
        parser_classes=(MultiPartParser,),
    )
    def post_attachment(self, request, *args, **kwargs):
        """
        Upload a single file as attachment.
        Validate that adding attachments is allowed in this application status
        """
        obj = self.get_object()
        if not ApplicationStatus.is_editable_status(self.request.user, obj.status):
            return Response(
                {"detail": _("Operation not allowed for this application status.")},
                status=status.HTTP_403_FORBIDDEN,
            )
        # Validate request data
        serializer = AttachmentSerializer(
            data={
                "application": obj.id,
                "attachment_file": request.data["attachment_file"],
                "content_type": request.data["attachment_file"].content_type,
                "attachment_type": request.data["attachment_type"],
            }
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def _get_attachment(self, attachment_pk):
        try:
            return self.get_object().attachments.get(id=attachment_pk)
        except exceptions.ObjectDoesNotExist:
            return None

    def _attachment_not_found(self):
        return Response(
            {"detail": _("File not found.")}, status=status.HTTP_404_NOT_FOUND
        )

    @action(
        methods=("DELETE",),
        detail=True,
        url_path="attachments/(?P<attachment_pk>[^/.]+)",
        parser_classes=(MultiPartParser,),
    )
    def delete_attachment(self, request, attachment_pk, *args, **kwargs):
        obj = self.get_object()
        if not ApplicationStatus.is_editable_status(self.request.user, obj.status):
            return Response(
                {"detail": _("Operation not allowed for this application status.")},
                status=status.HTTP_403_FORBIDDEN,
            )
        if instance := self._get_attachment(attachment_pk):
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return self._attachment_not_found()

    @action(
        methods=("GET",),
        detail=True,
        url_path="attachments/(?P<attachment_pk>[^/.]+)/download",
    )
    def download_attachment(self, request, attachment_pk, *args, **kwargs):
        """
        Download a single attachment
        """
        if (
            attachment := self._get_attachment(attachment_pk)
        ) and attachment.attachment_file:
            return FileResponse(attachment.attachment_file)
        else:
            return self._attachment_not_found()

    @extend_schema(
        description="Get a partial application object (not saved in database), with various fields pre-filled"
    )
    @action(detail=False, methods=["get"])
    def get_application_template(self, request, pk=None):
        """
        TODO: HL-33 (de minimis aid).
        Initial idea:
        if latest_application := get_latest_application():
            de_minimis_aid_set = DeMinimisAidSerializer(latest_de_minimis, many=True).data
            for v in de_minimis_aid_set:
                del v["id"]
        else:
            de_minimis_aid_set = []
        """
        de_minimis_aid_set = []
        return Response(
            {
                "de_minimis_aid": len(de_minimis_aid_set) > 0,
                "de_minimis_aid_set": de_minimis_aid_set,
            }
        )


@extend_schema(
    description="API for create/read/update/delete operations on Helsinki benefit applications for applicants"
)
class ApplicantApplicationViewSet(BaseApplicationViewSet):
    serializer_class = ApplicantApplicationSerializer
    permission_classes = [BFIsApplicant, TermsOfServiceAccepted]
    filterset_class = ApplicantApplicationFilter

    def _annotate_unread_messages_count(self, qs):
        # since there other annotations added elsewhere, use subquery to avoid wrong results.
        # also, using a subquery is more performant
        return qs.annotate(
            unread_messages_count=SubqueryCount(
                "messages",
                filter=Q(seen_by_applicant=False) & ~Q(message_type=MessageType.NOTE),
            )
        )

    def get_queryset(self):
        qs = super().get_queryset()
        # FIXME: Remove this when FE implemented authentication
        if settings.DISABLE_AUTHENTICATION:
            return qs
        company = get_company_from_request(self.request)
        if company:
            return self._annotate_unread_messages_count(company.applications).all()
        else:
            return Application.objects.none()


@extend_schema(
    description="API for create/read/update/delete operations on Helsinki benefit applications for application handlers"
)
class HandlerApplicationViewSet(BaseApplicationViewSet):
    serializer_class = HandlerApplicationSerializer
    permission_classes = [BFIsHandler]
    filterset_class = HandlerApplicationFilter

    def _annotate_unread_messages_count(self, qs):
        return qs.annotate(
            unread_messages_count=SubqueryCount(
                "messages",
                filter=Q(seen_by_handler=False) & ~Q(message_type=MessageType.NOTE),
            )
        )

    HANDLED_STATUSES = [
        ApplicationStatus.REJECTED,
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.CANCELLED,
    ]

    def get_queryset(self):
        # The default ordering in the handling views:
        # * In the "received" table, ordering should be by the send time, most recent first
        # * In the "handling" table, ordering should be by the calculation modification
        #   time, most recent first
        # * In the archive page, ordering should be by handled_at, most recent first.
        # All these goals are achieved by ordering by first handled_at, then
        # calculation.modified_at.
        # * in the "received" and "handling" table, no application has handled_at set yet,
        #   so applications will compare as equals
        # * For received applications, the send time is the same as calculation
        #   modification time
        return self._annotate_unread_messages_count(
            super()
            .get_queryset()
            .exclude(status=ApplicationStatus.DRAFT)
            .select_related("batch", "calculation")
            .prefetch_related(
                "pay_subsidies", "training_compensations", "calculation__rows"
            )
        ).order_by("-handled_at", "-calculation__modified_at")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if fields := self.request.query_params.get("fields", None):
            context.update({"fields": fields.split(",")})
        if exclude_fields := self.request.query_params.get("exclude_fields", None):
            context.update({"exclude_fields": exclude_fields.split(",")})
        return context

    @action(methods=["GET"], detail=False)
    def export_csv(self, request) -> StreamingHttpResponse:
        queryset = self.get_queryset()
        filtered_queryset = self.filter_queryset(queryset)
        return self._csv_response(filtered_queryset)

    CSV_ORDERING = "application_number"

    @action(methods=["GET"], detail=False)
    @transaction.atomic
    def export_new_accepted_applications(self, request) -> StreamingHttpResponse:
        return self._csv_response(
            self._create_application_batch(ApplicationStatus.ACCEPTED)
        )

    @action(methods=["GET"], detail=False)
    @transaction.atomic
    def export_new_rejected_applications(self, request) -> StreamingHttpResponse:
        return self._csv_response(
            self._create_application_batch(ApplicationStatus.REJECTED)
        )

    def _create_application_batch(self, status):
        """
        Create a new application batch out of the existing applications in the given status
        that are not yet assigned to a batch.
        """
        queryset = self.get_queryset().filter(status=status, batch__isnull=True)
        status_map = {
            ApplicationStatus.ACCEPTED: ApplicationBatchStatus.DECIDED_ACCEPTED,
            ApplicationStatus.REJECTED: ApplicationBatchStatus.DECIDED_REJECTED,
        }
        if status not in status_map:
            assert False, "Internal error, should not happen"
        application_ids = [application.pk for application in queryset]
        if queryset:
            batch = ApplicationBatch.objects.create(
                proposal_for_decision=status_map[status]
            )
            queryset.update(batch=batch)
        return self.get_queryset().filter(pk__in=application_ids)

    def _csv_response(self, queryset) -> StreamingHttpResponse:
        csv_service = ApplicationsCsvService(queryset.order_by(self.CSV_ORDERING))
        file_name = format_lazy(
            _("Helsinki-lisän hakemukset viety {date}"),
            date=timezone.now().strftime("%Y%m%d_%H%M%S"),
        )
        response = StreamingHttpResponse(
            csv_service.get_csv_string_lines_generator(), content_type="text/csv"
        )
        response["Content-Disposition"] = "attachment; filename={file_name}.csv".format(
            file_name=file_name
        )
        return response
