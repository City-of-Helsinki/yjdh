from django.shortcuts import get_object_or_404
from django_filters import rest_framework as filters
from drf_spectacular.utils import extend_schema
from rest_framework import filters as drf_filters, status
from rest_framework.response import Response
from rest_framework.views import APIView

from applications.enums import ApplicationTalpaStatus
from calculator.api.v1.serializers import (
    InstalmentSerializer,
    PreviousBenefitSerializer,
)
from calculator.enums import InstalmentStatus
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
        instalment_status = request.data["status"]
        serializer = InstalmentSerializer(
            instalment, data={"status": instalment_status}, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            application = instalment.calculation.application
            instalment_count = instalment.calculation.instalments.count()

            if instalment.instalment_number == 1:
                if instalment_status == InstalmentStatus.WAITING:
                    application.talpa_status = (
                        ApplicationTalpaStatus.NOT_PROCESSED_BY_TALPA
                    )
                    application.save()

                if instalment_status == InstalmentStatus.PAID:
                    if instalment_count == 1:
                        application.talpa_status = (
                            ApplicationTalpaStatus.SUCCESSFULLY_SENT_TO_TALPA
                        )
                    else:
                        application.talpa_status = (
                            ApplicationTalpaStatus.PARTIALLY_SENT_TO_TALPA
                        )
                    instalment.amount_paid = instalment.amount_after_recoveries
                    application.archived = True
                    instalment.save()
                    application.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            if instalment.instalment_number == 2:
                first_instalment = instalment.calculation.instalments.get(
                    instalment_number=1
                )
                if (
                    instalment_status == InstalmentStatus.CANCELLED
                    and first_instalment.amount_paid is not None
                ):
                    application.archived = True
                    application.save()
                    return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
