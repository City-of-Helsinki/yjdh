from rest_framework import status
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from events.api.v1.serializers import TetUpsertEventSerializer
from events.services import ServiceClient

# TODO do we need AuditLoggingViewSet from shared?


class JobPostingsViewSet(ViewSet):
    """CRUD operations for TET job postings"""

    def list(self, request):
        # TODO move to services.py
        job_postings = ServiceClient().list_job_postings_for_user(request.user)
        return Response(job_postings)
        # TODO any reason to use a serializer here?
        # serializer = TetPostingSerializer(queryset, many=True)
        # return serializer.data)

    def retrieve(self, request, pk=None):
        if pk is not None:
            return Response(ServiceClient().get_tet_event(pk, request.user))
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def create(self, request):
        serializer = TetUpsertEventSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        event = ServiceClient().add_tet_event(serializer.data, request.user)
        return Response(event, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        serializer = TetUpsertEventSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        updated_event = ServiceClient().update_tet_event(
            pk, serializer.data, request.user
        )
        if pk is not None:
            return Response(updated_event)
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, pk=None):
        if pk is not None:
            response_status = ServiceClient().delete_event(pk, request.user)
            return Response(status=response_status)
        else:
            return Response(status=status.HTTP_404_NOT_FOUND)
