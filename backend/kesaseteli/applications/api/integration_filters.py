import django_filters

from applications.models import EmployerSummerVoucher


class IntegrationExportFilterSet(django_filters.FilterSet):
    exclude_invoiced = django_filters.BooleanFilter(
        method="filter_exclude_invoiced",
        label="Exclude already invoiced records",
    )
    submitted_at_gte = django_filters.DateFilter(
        field_name="application__submitted_at", lookup_expr="date__gte"
    )
    submitted_at_lte = django_filters.DateFilter(
        field_name="application__submitted_at", lookup_expr="date__lte"
    )
    created_at_gte = django_filters.DateFilter(
        field_name="created_at", lookup_expr="date__gte"
    )
    created_at_lte = django_filters.DateFilter(
        field_name="created_at", lookup_expr="date__lte"
    )

    class Meta:
        model = EmployerSummerVoucher
        fields = [
            "exclude_invoiced",
            "submitted_at_gte",
            "submitted_at_lte",
            "created_at_gte",
            "created_at_lte",
        ]

    def filter_exclude_invoiced(self, queryset, name, value):
        if value:
            return queryset.filter(invoiced_at__isnull=True)
        return queryset
