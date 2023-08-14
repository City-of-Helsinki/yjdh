from rest_framework import serializers

from applications.models import ReviewState


class ReviewStateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewState
        fields = "__all__"
