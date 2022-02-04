from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import status

from events.api.v1.serializers import TetUpsertEventSerializer
from events.services import list_job_postings_for_user, add_tet_event

# TODO do we need AuditLoggingViewSet from shared?
class JobPostingsViewSet(ViewSet):
    """CRUD operations for TET job postings"""

    def list(self, request):
        # TODO move to services.py
        job_postings = list_job_postings_for_user(request.user)
        return Response(job_postings)
        # TODO any reason to use a serializer here?
        # serializer = TetPostingSerializer(queryset, many=True)
        # return serializer.data)

    def create(self, request):
        serializer = TetUpsertEventSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        event = add_tet_event(serializer.data, request.user)
        return Response(
            event, status=status.HTTP_201_CREATED
        )

