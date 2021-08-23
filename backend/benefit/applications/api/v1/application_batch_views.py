from applications.api.v1.serializers import ApplicationBatchSerializer
from applications.enums import ApplicationBatchStatus
from applications.models import ApplicationBatch
from django_filters import rest_framework as filters
from django_filters.widgets import CSVWidget
from drf_spectacular.utils import extend_schema
from rest_framework import filters as drf_filters, viewsets
from rest_framework.permissions import AllowAny


class ApplicationBatchFilter(filters.FilterSet):

    status = filters.MultipleChoiceFilter(
        field_name="status",
        widget=CSVWidget,
        choices=ApplicationBatchStatus.choices,
        help_text=(
            "Filter by application batch status."
            " Multiple statuses may be specified as a comma-separated list, such as 'status=draft,decided'",
        ),
    )

    class Meta:
        model = ApplicationBatch
        fields = {
            "proposal_for_decision": ["exact"],
        }


@extend_schema(
    description="API for create/read/update/delete operations on Helsinki benefit application batches"
)
class ApplicationBatchViewSet(viewsets.ModelViewSet):
    queryset = ApplicationBatch.objects.all()
    serializer_class = ApplicationBatchSerializer
    permission_classes = [AllowAny]  # TODO access control
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
