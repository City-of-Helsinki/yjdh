from applications.api.v1.serializers import ApplicationSerializer
from applications.enums import ApplicationStatus
from applications.models import Application
from common.exceptions import BenefitAPIException
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [AllowAny]  # TODO access control

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

    def get_queryset(self):
        """
        Optionally, filter by "status" parameter in the query.
        Multiple statuses may be specified as a comma-separated list, such as "status=draft,received"

        TODO: Applicants get to view only the applications to their own company
        user = self.request.user
        return Purchase.objects.filter(purchaser=user)

        """

        queryset = Application.objects.all()
        if statuses := self.request.query_params.get("status"):
            status_list = statuses.split(",")
            for status in status_list:
                if status not in ApplicationStatus.values:
                    raise BenefitAPIException(f"Invalid status: {status}")
            queryset = queryset.filter(status__in=status_list)
        return queryset
