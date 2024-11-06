from django.shortcuts import get_object_or_404
from django_filters import rest_framework as filters
from drf_spectacular.utils import extend_schema
from rest_framework import filters as drf_filters, status
from rest_framework.response import Response
from rest_framework.views import APIView

from calculator.api.v1.serializers import (
    InstalmentSerializer,
    PreviousBenefitSerializer,
)
from calculator.models import Instalment, PreviousBenefit
from common.permissions import BFIsHandler
from shared.audit_log.viewsets import AuditLoggingModelViewSet


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
class PreviousBenefitViewSet(AuditLoggingModelViewSet):
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


class InstalmentView(APIView):
    permission_classes = [BFIsHandler]

    def patch(self, request, instalment_id):
        instalment = get_object_or_404(Instalment, pk=instalment_id)

        serializer = InstalmentSerializer(instalment, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
