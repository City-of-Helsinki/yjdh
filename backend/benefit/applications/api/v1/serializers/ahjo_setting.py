from rest_framework import serializers

from applications.models import AhjoSetting


class AhjoSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = AhjoSetting
        exclude = ["id", "created_at", "modified_at"]
