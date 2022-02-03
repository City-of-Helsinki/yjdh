from rest_framework.viewsets import ViewSet
from rest_framework.response import Response

from events.api.v1.serializers import TetPostingSerializer
from events.transformations import event_to_job_posting, job_posting_to_event
from events.services import list_job_postings_for_user

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

