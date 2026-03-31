import logging

from django.db.models import QuerySet
from django.http import StreamingHttpResponse
from django.utils import timezone
from django_filters import DateFromToRangeFilter
from django_filters import rest_framework as filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from applications.api.v1.serializers.deminimis_callback import DeMinimisCallbackSerializer
from applications.models import Application, ApplicationBatch
from applications.services.applications_deminimis_csv_report import (
    ApplicationsDeminimisCsvService,
)
from common.authentications import DeMinimisAuthentication

LOGGER = logging.getLogger(__name__)


class ApplicationDeMinimisFilter(filters.FilterSet):
    decision_date = DateFromToRangeFilter(
        field_name="batch__decision_date", label="Batch decision date (range)"
    )

    class Meta:
        model = Application
        fields = ["decision_date"]

    def filter_queryset(self, queryset):
        """
        Custom filtering logic that ensures only applications with 
        a batch and a non-null decision_date
        and benefit is granted as de minimis aid
        and that it is not yet reported as aid are returned, 
        and then applies any additional filters 
        such as decision_date range if provided.
        """
        queryset = queryset.filter(
            batch__isnull=False,
            batch__decision_date__isnull=False,
            batch__de_minimis_grant_send=False,
            calculation__granted_as_de_minimis_aid=True
        )
        return super().filter_queryset(queryset)


class DeMinimisIntegrationView(APIView):
    authentication_classes = [DeMinimisAuthentication]
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_class = ApplicationDeMinimisFilter

    def get(self, request, *args, **kwargs) -> StreamingHttpResponse:
        # Apply the filter
        filterset = ApplicationDeMinimisFilter(
            request.GET,
            queryset=Application.objects.all(),
        )

        if filterset.is_valid():
            # Get the filtered queryset from the filter class
            applications_with_not_reported_de_minimis_aid = filterset.qs
            # Generate the CSV response from the filtered queryset
            response = self._csv_response(
                queryset=applications_with_not_reported_de_minimis_aid
            )
            return response
        else:
            # Handle invalid filters (e.g., return a default queryset or handle the
            # error)
            return StreamingHttpResponse("Invalid filters", status=400)

    def _csv_response(
        self,
        queryset: QuerySet[Application],
    ) -> StreamingHttpResponse:
        csv_service = ApplicationsDeminimisCsvService(
            queryset,
        )
        response = StreamingHttpResponse(
            csv_service.get_csv_string_lines_generator(add_bom=True),
            content_type="text/csv",
        )

        response["Content-Disposition"] = "attachment; filename={filename}.csv".format(
            filename=self._filename()
        )
        return response

    @staticmethod
    def _filename():
        return f"deminimis_data_{timezone.now().strftime('%Y%m%d_%H%M%S')}"


# The callback view is implemented in the same file for better cohesion, as it is closely related to the integration view and handles the callback from the de minimis aid reporting system.
class DeMinimisCallbackView(APIView):
    authentication_classes = [DeMinimisAuthentication]
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = DeMinimisCallbackSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if serializer.validated_data["status"] == "Success":
            self._handle_successful_applications(
                serializer.validated_data["successful_applications"]
            )
        if serializer.validated_data["failed_applications"]:
            LOGGER.error(
                f"De minimis callback reported failures for applications: "
                f"{serializer.validated_data['failed_applications']}"
            )

        return Response({"message": "Callback received"}, status=status.HTTP_200_OK)

    def _handle_successful_applications(self, application_numbers: list):
        batches = ApplicationBatch.objects.filter(
            applications__application_number__in=application_numbers,
            de_minimis_grant_send=False,
        ).distinct()
        updated_count = batches.update(de_minimis_grant_send=True)
        LOGGER.info(
            f"Marked {updated_count} batches as reported for de minimis aid "
            f"(applications: {application_numbers})."
        )
