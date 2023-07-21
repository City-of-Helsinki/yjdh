from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from applications.api.v1.serializers.review_state import ReviewStateSerializer
from applications.models import Application, ReviewState
from common.permissions import BFIsHandler


class ReviewStateViewSet(APIView):
    permission_classes = [BFIsHandler]

    def get(self, _, application_id):
        try:
            review_state = ReviewState.objects.get(application=application_id)
        except ReviewState.DoesNotExist:
            application = Application.objects.get(id=application_id)
            if application:
                review_state = ReviewState.objects.create(application=application)
            else:
                return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = ReviewStateSerializer(review_state)
        return Response(serializer.data)

    def put(self, request, application_id):
        try:
            review_state = ReviewState.objects.get(application=application_id)
        except ReviewState.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = ReviewStateSerializer(review_state, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
