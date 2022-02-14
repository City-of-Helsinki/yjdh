from calculator.api.v1.serializers import PreviousBenefitSerializer
from calculator.models import PreviousBenefit
from common.permissions import BFIsHandler
from django_filters import rest_framework as filters
from drf_spectacular.utils import extend_schema
from rest_framework import filters as drf_filters, viewsets


class PreviousBenefitFilter(filters.FilterSet):
    class Meta:
        model = PreviousBenefit
        fields = {
            "company__name": ["iexact", "icontains"],
            "social_security_number": ["exact", "iexact"],
            "start_date": ["lt", "lte", "gt", "gte", "exact"],
            "end_date": ["lt", "lte", "gt", "gte", "exact"],
        }


@extend_schema(
    description="API for create/read/update/delete operations on PreviousBenefit objects"
)
class PreviousBenefitViewSet(viewsets.ModelViewSet):
    queryset = PreviousBenefit.objects.all()
    serializer_class = PreviousBenefitSerializer
    permission_classes = [BFIsHandler]
    filter_backends = [
        drf_filters.OrderingFilter,
        filters.DjangoFilterBackend,
        drf_filters.SearchFilter,
    ]
    filterset_class = PreviousBenefitFilter
    search_fields = ["company__name", "social_security_number"]
