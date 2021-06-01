from rest_framework import mixins, viewsets

from applications.api.v1.serializers import ApplicationSerializer
from applications.models import Application


class ApplicationViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Application.objects.select_related("company").prefetch_related(
        "summer_vouchers"
    )
    serializer_class = ApplicationSerializer
