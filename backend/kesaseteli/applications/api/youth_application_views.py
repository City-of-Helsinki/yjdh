import django_filters
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework.generics import ListAPIView
from rest_framework.pagination import LimitOffsetPagination

from applications.api.integration_views import (
    AnonymousYouthApiKeyPermission,
    YouthApiKeyPermission,
)
from applications.api.v1.serializers import (
    AnonymousYouthApplicationExportSerializer,
    YouthApplicationExportSerializer,
)
from applications.models import YouthApplication

_GTE_HELP = "Filter by {field} date greater than or equal to (YYYY-MM-DD)."
_LTE_HELP = "Filter by {field} date less than or equal to (YYYY-MM-DD)."


class YouthApplicationExportFilterSet(django_filters.FilterSet):
    created_at_gte = django_filters.DateFilter(
        field_name="created_at",
        lookup_expr="date__gte",
        help_text=_GTE_HELP.format(field="created_at"),
    )
    created_at_lte = django_filters.DateFilter(
        field_name="created_at",
        lookup_expr="date__lte",
        help_text=_LTE_HELP.format(field="created_at"),
    )
    handled_at_gte = django_filters.DateFilter(
        field_name="handled_at",
        lookup_expr="date__gte",
        help_text=_GTE_HELP.format(field="handled_at"),
    )
    handled_at_lte = django_filters.DateFilter(
        field_name="handled_at",
        lookup_expr="date__lte",
        help_text=_LTE_HELP.format(field="handled_at"),
    )
    additional_info_provided_at_gte = django_filters.DateFilter(
        field_name="additional_info_provided_at",
        lookup_expr="date__gte",
        help_text=_GTE_HELP.format(field="additional_info_provided_at"),
    )
    additional_info_provided_at_lte = django_filters.DateFilter(
        field_name="additional_info_provided_at",
        lookup_expr="date__lte",
        help_text=_LTE_HELP.format(field="additional_info_provided_at"),
    )
    receipt_confirmed_at_gte = django_filters.DateFilter(
        field_name="receipt_confirmed_at",
        lookup_expr="date__gte",
        help_text=_GTE_HELP.format(field="receipt_confirmed_at"),
    )
    receipt_confirmed_at_lte = django_filters.DateFilter(
        field_name="receipt_confirmed_at",
        lookup_expr="date__lte",
        help_text=_LTE_HELP.format(field="receipt_confirmed_at"),
    )

    class Meta:
        model = YouthApplication
        fields = [
            "is_vtj_data_restricted",
            "handler",
            "target_group",
            "postcode",
            "language",
            "status",
        ]


@extend_schema(
    tags=["reporting-integration"],
    summary="Export Youth Applications",
    description=(
        "JSON Export endpoint for active Youth Applications. "
        "Allows querying and exporting applications for external integrations. "
        "Supports filtering by various dates, status, language, "
        "postcode, handler, etc. Uses Limit/Offset pagination. "
        "Requires a valid API key in the X-API-Key header."
    ),
)
class YouthApplicationExportView(ListAPIView):
    permission_classes = [YouthApiKeyPermission]
    pagination_class = LimitOffsetPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = YouthApplicationExportFilterSet
    serializer_class = YouthApplicationExportSerializer

    def get_queryset(self):
        return YouthApplication.objects.active().order_by("created_at", "pk")


@extend_schema(
    tags=["reporting-integration"],
    summary="Export Youth Applications (Anonymous)",
    description=(
        "Same as the standard youth application export, but with all "
        "personally identifiable information removed. Suitable for "
        "Power BI and other reporting systems.\n\n"
        "**Authentication**: Requires a valid API key in the X-API-Key header "
        "matching the server-side ``ANONYMOUS_YOUTH_EXPORT_API_KEY`` setting."
    ),
)
class AnonymousYouthApplicationExportView(YouthApplicationExportView):
    permission_classes = [AnonymousYouthApiKeyPermission]
    serializer_class = AnonymousYouthApplicationExportSerializer
