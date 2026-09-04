from datetime import date

import django_filters
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework.exceptions import ValidationError
from rest_framework.generics import ListAPIView
from rest_framework.pagination import LimitOffsetPagination

from applications.api.integration_filters import IntegrationExportFilterSet
from applications.api.integration_serializers import (
    AnonymousReportingExportSerializer,
    ReportingExportSerializer,
)
from applications.api.integration_views import (
    AnonymousReportingApiKeyPermission,
    ReportingApiKeyPermission,
)
from applications.enums import APPLICATION_LANGUAGE_CHOICES, EmployerApplicationStatus
from applications.models import EmployerSummerVoucher
from applications.target_groups import get_target_group_choices


class EmployerSummerVoucherReportingExportFilterSet(IntegrationExportFilterSet):
    year = django_filters.NumberFilter(
        method="filter_year",
        label="Calendar year (defaults to current year)",
    )

    language = django_filters.ChoiceFilter(
        choices=APPLICATION_LANGUAGE_CHOICES,
        field_name="application__language",
        label="Language",
    )
    status = django_filters.MultipleChoiceFilter(
        choices=EmployerApplicationStatus.choices,
        field_name="application__status",
        label="Status",
    )
    postcode = django_filters.CharFilter(
        field_name="employment_postcode",
        label="Employment postcode",
    )
    target_group = django_filters.MultipleChoiceFilter(
        choices=get_target_group_choices(),
        field_name="youth_summer_voucher__youth_application__target_group",
        label="Target group",
    )

    def filter_year(self, queryset, name, value):
        return queryset.filter(application__created_at__year=int(value)).exclude(
            application__status=EmployerApplicationStatus.DRAFT
        )


@extend_schema(
    tags=["reporting-integration"],
    summary="Export employer summer vouchers (Reporting)",
    description=(
        "Returns non-draft employer summer vouchers for a given calendar year "
        "(defaults to the current year). Intended for external reporting systems.\n\n"
        "**Scope**: Only vouchers whose application was created in the requested "
        "``year`` and is non-DRAFT are included. Use the date filters "
        "(``submitted_at_gte``, ``submitted_at_lte``, ``created_at_gte``, "
        "``created_at_lte``) to narrow within the year. Additional supported "
        "filters include ``status``, ``language``, ``postcode``, and "
        "``target_group``. Use "
        "``exclude_invoiced=true`` to omit vouchers already marked as invoiced "
        "by the Talpa process.\n\n"
        "**Authentication**: Requires a valid ``X-Api-Key`` header matching "
        "the server-side ``REPORTING_EXPORT_API_KEY`` setting."
    ),
)
class EmployerSummerVoucherReportingExportView(ListAPIView):
    """
    JSON export endpoint for the external Reporting integration.

    Returns a paginated list of non-DRAFT employer summer vouchers for a
    given calendar year (defaults to the current year). The dataset mirrors
    what the annual Excel export produces, giving reporting consumers a
    stable, machine-readable alternative.

    Use the ``year`` query parameter to request a specific year. Date-range
    filters (``submitted_at_gte`` / ``lte``, ``created_at_gte`` / ``lte``)
    can narrow the result further within the selected year.

    Authentication is via a static API key (``X-Api-Key`` header).
    """

    permission_classes = [ReportingApiKeyPermission]
    pagination_class = LimitOffsetPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = EmployerSummerVoucherReportingExportFilterSet
    serializer_class = ReportingExportSerializer

    def get_queryset(self):
        year_param = self.request.query_params.get("year", date.today().year)
        try:
            year = int(year_param)
        except ValueError:
            raise ValidationError({"year": ["A valid integer is required."]})
        return EmployerSummerVoucher.objects.annual(year).for_export()


@extend_schema(
    tags=["reporting-integration"],
    summary="Export employer summer vouchers (Anonymous Reporting)",
    description=(
        "Same as the standard reporting export, but with all personally "
        "identifiable information removed. Suitable for Power BI and "
        "other reporting systems that must not process personal data.\n\n"
        "**Scope**: Only vouchers whose application was created in the requested "
        "``year`` and is non-DRAFT are included.\n\n"
        "**Authentication**: Requires a valid ``X-Api-Key`` header matching "
        "the server-side ``ANONYMOUS_REPORTING_EXPORT_API_KEY`` setting."
    ),
)
class AnonymousEmployerSummerVoucherReportingExportView(
    EmployerSummerVoucherReportingExportView
):
    permission_classes = [AnonymousReportingApiKeyPermission]
    serializer_class = AnonymousReportingExportSerializer
