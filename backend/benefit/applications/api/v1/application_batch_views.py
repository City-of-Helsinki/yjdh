from django.db import transaction
from django.forms import ValidationError
from django.http import HttpResponse, StreamingHttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.text import format_lazy
from django.utils.translation import gettext_lazy as _
from django_filters import rest_framework as filters
from django_filters.widgets import CSVWidget
from drf_spectacular.utils import extend_schema
from rest_framework import filters as drf_filters, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from applications.api.v1.serializers.batch import (
    ApplicationBatchListSerializer,
    ApplicationBatchSerializer,
)
from applications.enums import ApplicationBatchStatus, ApplicationStatus
from applications.models import Application, ApplicationBatch
from applications.services.ahjo_integration import export_application_batch
from applications.services.talpa_integration import TalpaService
from common.authentications import RobotBasicAuthentication
from common.permissions import BFIsHandler
from shared.audit_log.viewsets import AuditLoggingModelViewSet


class ApplicationBatchFilter(filters.FilterSet):
    status = filters.MultipleChoiceFilter(
        field_name="status",
        widget=CSVWidget,
        choices=ApplicationBatchStatus.choices,
        help_text=(
            "Filter by application batch status. Multiple statuses may be specified as"
            " a comma-separated list, such as 'status=draft,decided'",
        ),
    )

    class Meta:
        model = ApplicationBatch
        fields = {
            "proposal_for_decision": ["exact"],
        }


@extend_schema(
    description=(
        "API for create/read/update/delete/export operations on Helsinki benefit"
        " application batches"
    )
)
class ApplicationBatchViewSet(AuditLoggingModelViewSet):
    queryset = ApplicationBatch.objects.all()
    serializer_class = ApplicationBatchSerializer
    permission_classes = [BFIsHandler]
    filter_backends = [
        drf_filters.OrderingFilter,
        filters.DjangoFilterBackend,
        drf_filters.SearchFilter,
    ]
    filterset_class = ApplicationBatchFilter
    search_fields = [
        "applications__company_name",
        "applications__company_contact_person_email",
    ]

    def get_serializer_class(self):
        """
        ApplicationBatchSerializer for default behaviour on mutation functions,
        ApplicationBatchListSerializer for listing applications on a batch
        """
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return ApplicationBatchSerializer

        return ApplicationBatchListSerializer

    def get_batch(self, id: str) -> ApplicationBatch:
        """
        Just a wrapper for Django's get_object_or_404 function
        """
        return get_object_or_404(ApplicationBatch, id=id)

    @transaction.atomic
    def destroy(self, request, pk=None):
        """
        Override default destroy(), batch can only be deleted if it's status is "draft"
        """
        batch = self.get_batch(pk)
        if batch.status == ApplicationBatchStatus.DRAFT:
            batch.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(status=status.HTTP_406_NOT_ACCEPTABLE)

    @action(methods=("GET",), detail=True, url_path="export")
    def export_batch(self, request, *args, **kwargs):
        """
        Export ApplicationBatch to pdf format
        """
        batch = self.get_object()
        if batch.status in (
            ApplicationBatchStatus.DRAFT,
            ApplicationBatchStatus.AHJO_REPORT_CREATED,
        ):
            if batch.status == ApplicationBatchStatus.DRAFT:
                batch.status = ApplicationBatchStatus.AHJO_REPORT_CREATED
                batch.save()
        else:
            return Response(
                {
                    "detail": _(
                        "Application status cannot be exported because of invalid"
                        " status"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if batch.applications.count() <= 0:
            return Response(
                {"detail": _("Cannot export empty batch")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        zip_file = export_application_batch(batch)
        file_name = format_lazy(
            _("Application batch {date}"),
            date=timezone.now().strftime("%d-%m-%Y %H.%M.%S"),
        )
        response = HttpResponse(zip_file, content_type="application/x-zip-compressed")
        response["Content-Disposition"] = "attachment; filename={file_name}.zip".format(
            file_name=file_name
        )
        return response

    @action(
        methods=("GET",),
        detail=False,
        url_path="talpa_export",
        authentication_classes=[RobotBasicAuthentication],
        permission_classes=[AllowAny],
    )
    @transaction.atomic
    def talpa_export_batch(self, request, *args, **kwargs) -> StreamingHttpResponse:
        """
        Export ApplicationBatch to CSV format for Talpa Robot
        """
        approved_batches = ApplicationBatch.objects.filter(
            status=ApplicationBatchStatus.DECIDED_ACCEPTED
        )
        if approved_batches.count() == 0:
            return Response(
                {
                    "detail": _(
                        "There is no available application to export, please try again"
                        " later"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        talpa_service = TalpaService(approved_batches)
        file_name = format_lazy(
            _("TALPA export {date}"),
            date=timezone.now().strftime("%Y%m%d_%H%M%S"),
        )
        response = StreamingHttpResponse(
            talpa_service.get_csv_string_lines_generator(), content_type="text/csv"
        )
        response["Content-Disposition"] = "attachment; filename={file_name}.csv".format(
            file_name=file_name
        )
        approved_batches.all().update(status=ApplicationBatchStatus.SENT_TO_TALPA)
        return response

    @action(methods=["PATCH"], detail=False)
    @transaction.atomic
    def assign_applications(self, request):
        """
        Assign one or more applications to a batch. If there's no batch for given app status,
        create one as a draft and assign all applications to it.
        """
        app_status = request.data["status"]
        app_ids = request.data["application_ids"]

        def create_application_batch_by_ids(app_status, apps):
            if apps:
                batch = ApplicationBatch.objects.create(
                    proposal_for_decision=app_status
                )
                return batch

        if (
            app_status not in [ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED]
            or type(app_ids) != list
        ):
            return Response(
                {"detail": "Status or application id is not valid"},
                status=status.HTTP_406_NOT_ACCEPTABLE,
            )

        apps = Application.objects.filter(
            status=app_status, batch__isnull=True, pk__in=app_ids
        )

        # Try finding an existing batch
        batch = (
            ApplicationBatch.objects.filter(
                status=ApplicationBatchStatus.DRAFT, proposal_for_decision=app_status
            ).first()
        ) or create_application_batch_by_ids(
            app_status,
            apps,
        )

        if batch:
            apps.update(batch=batch)
            batch = ApplicationBatchSerializer(batch)
            return Response(batch.data, status=status.HTTP_200_OK)
        else:
            return Response(
                {
                    "detail": "Unable to create a new batch or merge application to existing one."
                },
                status=status.HTTP_406_NOT_ACCEPTABLE,
            )

    @action(methods=["PATCH"], detail=True)
    @transaction.atomic
    def deassign_applications(self, request, pk=None):
        """
        Remove one or more applications from a specific batch
        """
        application_ids = request.data.get("application_ids")
        batch = self.get_batch(pk)

        apps = Application.objects.filter(
            pk__in=application_ids,
            status__in=["accepted", "rejected"],
            batch=batch,
        )
        if apps:
            for app in apps:
                app.batch = None
                app.save()
            return Response(status=status.HTTP_200_OK)
        return Response(
            {"detail": "Applications were not applicable to be detached."},
            status=status.HTTP_404_NOT_FOUND,
        )

    @action(methods=["PATCH"], detail=True)
    @transaction.atomic
    def status(self, request, pk=None):
        """
        Assign a new status for batch: as pending for Ahjo proposal or switch back to draft
        """
        new_status = request.data["status"]
        batch = self.get_batch(pk)
        if new_status not in [
            ApplicationBatchStatus.DRAFT,
            ApplicationBatchStatus.AWAITING_AHJO_DECISION,
            ApplicationBatchStatus.DECIDED_ACCEPTED,
            ApplicationBatchStatus.DECIDED_REJECTED,
        ]:
            return Response(status=status.HTTP_406_NOT_ACCEPTABLE)

        if new_status in [
            ApplicationBatchStatus.DECIDED_ACCEPTED,
            ApplicationBatchStatus.DECIDED_REJECTED,
        ]:
            # Archive all applications if this batch will be completed
            Application.objects.filter(batch=batch).update(archived=True)

            for key in request.data:
                setattr(batch, key, request.data.get(key))

        batch.status = new_status

        try:
            batch.save()
        except ValidationError:
            return Response(
                {"errorKey": "batchDraftAlreadyExists"},
                status=status.HTTP_406_NOT_ACCEPTABLE,
            )

        return Response(
            {
                "id": batch.id,
                "status": batch.status,
                "decision": batch.proposal_for_decision,
            },
            status=status.HTTP_200_OK,
        )
