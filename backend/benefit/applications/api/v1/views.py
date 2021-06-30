from applications.api.v1.serializers import ApplicationSerializer
from applications.enums import ApplicationStatus
from applications.models import Application
from django_filters import rest_framework as filters
from django_filters.widgets import CSVWidget
from drf_spectacular.utils import extend_schema
from rest_framework import filters as drf_filters, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


class ApplicationFilter(filters.FilterSet):

    status = filters.MultipleChoiceFilter(
        field_name="status",
        widget=CSVWidget,
        choices=ApplicationStatus.choices,
        help_text=(
            "Filter by application status."
            " Multiple statuses may be specified as a comma-separated list, such as 'status=draft,received'",
        ),
    )

    class Meta:
        model = Application
        fields = {
            "archived": ["exact"],
            "company__business_id": ["exact"],
            "benefit_type": ["exact"],
            "company_name": ["iexact", "icontains"],
        }


@extend_schema(
    description="API for create/read/update/delete operations on Helsinki benefit applications"
)
class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [AllowAny]  # TODO access control
    filter_backends = [
        drf_filters.OrderingFilter,
        filters.DjangoFilterBackend,
        drf_filters.SearchFilter,
    ]
    filterset_class = ApplicationFilter
    search_fields = ["company_name", "company_contact_person_email"]

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
