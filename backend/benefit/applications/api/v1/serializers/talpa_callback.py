from rest_framework import serializers


class TalpaCallbackSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=["Success", "Failure"])
    successful_applications = serializers.ListField(child=serializers.IntegerField())
    failed_applications = serializers.ListField(child=serializers.IntegerField())

    def validate(self, data):
        """
        Check that successful_applications and failed_applications are not both empty.
        """
        if not data.get("successful_applications") and not data.get(
            "failed_applications"
        ):
            raise serializers.ValidationError(
                "Both successful_applications and failed_applications cannot be empty."
            )

        return data
