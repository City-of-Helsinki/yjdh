from django.db.models import Count
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from applications.enums import EmployerApplicationStatus, YouthApplicationStatus
from applications.models import EmployerApplication, YouthApplication
from common.decorators import enforce_handler_view_adfs_login

YOUTH_PENDING_STATUSES = [
    YouthApplicationStatus.AWAITING_MANUAL_PROCESSING.value,
    YouthApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED.value,
    YouthApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED.value,
]
YOUTH_PROCESSED_STATUSES = [
    YouthApplicationStatus.ACCEPTED.value,
    YouthApplicationStatus.REJECTED.value,
]

EMPLOYER_PENDING_STATUSES = [
    EmployerApplicationStatus.SUBMITTED.value,
    EmployerApplicationStatus.ADDITIONAL_INFORMATION_REQUESTED.value,
    EmployerApplicationStatus.ADDITIONAL_INFORMATION_PROVIDED.value,
    EmployerApplicationStatus.APPLICATION_HANDLING.value,
    EmployerApplicationStatus.ERROR_IN_PAYMENT.value,
]
EMPLOYER_PROCESSED_STATUSES = [
    EmployerApplicationStatus.PAYMENT_REVIEW.value,
    EmployerApplicationStatus.ACCEPTED_FOR_PAYMENT.value,
    EmployerApplicationStatus.SENT_FOR_PAYMENT.value,
    EmployerApplicationStatus.RECEIVED_BY_PAYMENT_SYSTEM.value,
    EmployerApplicationStatus.REJECTED.value,
    EmployerApplicationStatus.CANCELLED.value,
    # EmployerApplicationStatus.REJECTED_BY_TALPA.value,
]


class DashboardStatsView(APIView):
    """
    Returns aggregated status counts for dashboard.
    Only accessible by ADFS authenticated handler users.
    """

    # Permissions are handled by the @enforce_handler_view_adfs_login decorator
    permission_classes = [AllowAny]

    @enforce_handler_view_adfs_login
    def get(self, request, *args, **kwargs):
        youth_counts_raw = YouthApplication.objects.values("status").annotate(
            count=Count("id")
        )
        employer_counts_raw = EmployerApplication.objects.values("status").annotate(
            count=Count("id")
        )

        youth_counts = {item["status"]: item["count"] for item in youth_counts_raw}
        employer_counts = {
            item["status"]: item["count"] for item in employer_counts_raw
        }

        youth_pending_count = sum(
            youth_counts.get(s, 0) for s in YOUTH_PENDING_STATUSES
        )
        youth_processed_count = sum(
            youth_counts.get(s, 0) for s in YOUTH_PROCESSED_STATUSES
        )

        employer_pending_count = sum(
            employer_counts.get(s, 0) for s in EMPLOYER_PENDING_STATUSES
        )
        employer_processed_count = sum(
            employer_counts.get(s, 0) for s in EMPLOYER_PROCESSED_STATUSES
        )

        return Response(
            {
                "youth_applications": {
                    "pending": youth_pending_count,
                    "processed": youth_processed_count,
                    "raw_counts": youth_counts,
                },
                "employer_applications": {
                    "pending": employer_pending_count,
                    "processed": employer_processed_count,
                    "raw_counts": employer_counts,
                },
            }
        )
