from rest_framework import serializers


class AhjoCallbackSerializer(serializers.Serializer):
    message = serializers.CharField(required=False)
    requestId = serializers.UUIDField(format="hex_verbose", required=False)  # noqa: N815
    caseId = serializers.CharField(required=False)  # noqa: N815
    caseGuid = serializers.UUIDField(format="hex_verbose", required=False)  # noqa: N815
    records = serializers.ListField(required=False)
    failureDetails = serializers.ListField(required=False)  # noqa: N815

    # You can add additional validation here if needed
    def validate_message(self, message):
        # Example of custom field validation
        if message not in ["Success", "Failure"]:
            raise serializers.ValidationError("Invalid message value.")
        return message


class AhjoDecisionCallbackSerializer(serializers.Serializer):
    updatetype = serializers.CharField(required=False)
    id = serializers.CharField(required=False)
    caseId = serializers.CharField(required=False)  # noqa: N815
    caseGuid = serializers.UUIDField(format="hex_verbose", required=False)  # noqa: N815
