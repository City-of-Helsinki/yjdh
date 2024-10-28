import logging

from django.db.models import QuerySet
from django.http import StreamingHttpResponse
from django.utils import timezone
from django_filters import DateFromToRangeFilter, rest_framework as filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from applications.models import Application
from applications.services.applications_power_bi_csv_report import (
    ApplicationsPowerBiCsvService,
)
from common.authentications import PowerBiAuthentication

LOGGER = logging.getLogger(__name__)


class ApplicationPowerBiFilter(filters.FilterSet):
    decision_date = DateFromToRangeFilter(
        field_name="batch__decision_date", label="Batch decision date (range)"
    )

    class Meta:
        model = Application
        fields = ["decision_date"]

    def filter_queryset(self, queryset):
        """
        Custom filtering logic that ensures only applications with a batch
        and a non-null decision_date are returned, and then applies any
        additional filters such as decision_date range if provided.
        """
        queryset = queryset.filter(
            batch__isnull=False, batch__decision_date__isnull=False
        )
        return super().filter_queryset(queryset)


class PowerBiIntegrationView(APIView):
    authentication_classes = [PowerBiAuthentication]
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_class = ApplicationPowerBiFilter

    def get(self, request, *args, **kwargs) -> StreamingHttpResponse:
        # Apply the filter
        filterset = ApplicationPowerBiFilter(
            request.GET,
            queryset=Application.objects.all().prefetch_related("alteration_set"),
        )

        if filterset.is_valid():
            # Get the filtered queryset from the filter class
            applications_with_batch_and_decision_date = filterset.qs
            # Generate the CSV response from the filtered queryset
            response = self._csv_response(
                queryset=applications_with_batch_and_decision_date
            )
            return response
        else:
            # Handle invalid filters (e.g., return a default queryset or handle the error)
            return StreamingHttpResponse("Invalid filters", status=400)

    def _csv_response(
        self,
        queryset: QuerySet[Application],
        prune_data_for_talpa: bool = False,
    ) -> StreamingHttpResponse:
        csv_service = ApplicationsPowerBiCsvService(
            queryset,
            prune_data_for_talpa,
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
        return f"power_bi_data_{timezone.now().strftime('%Y%m%d_%H%M%S')}"
