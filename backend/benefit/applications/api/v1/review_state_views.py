from rest_framework.viewsets import ModelViewSet

from applications.api.v1.serializers.review_state import ReviewStateSerializer
from applications.models import ReviewState
from common.permissions import BFIsHandler


class ReviewStateViewSet(ModelViewSet):
    queryset = ReviewState.objects.all()
    serializer_class = ReviewStateSerializer
    permission_classes = [BFIsHandler]
