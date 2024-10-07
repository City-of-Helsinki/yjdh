from rest_framework import serializers

from applications.models import AhjoStatus


class AhjoStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = AhjoStatus
        fields = ["modified_at", "error_from_ahjo", "validation_error_from_ahjo"]
