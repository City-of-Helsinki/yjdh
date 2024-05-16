from rest_framework import serializers


class AhjoCallbackSerializer(serializers.Serializer):
    message = serializers.CharField(required=False)
    requestId = serializers.UUIDField(format="hex_verbose", required=False)
    caseId = serializers.CharField(required=False)
    caseGuid = serializers.UUIDField(format="hex_verbose", required=False)
    records = serializers.ListField(required=False)

    # You can add additional validation here if needed
    def validate_message(self, message):
        # Example of custom field validation
        if message not in ["Success", "Failure"]:
            raise serializers.ValidationError("Invalid message value.")
        return message


class AhjoDecisionCallbackSerializer(serializers.Serializer):
    updatetype = serializers.CharField(required=True)
    id = serializers.CharField(required=True)
    caseId = serializers.CharField(required=True)
    caseGuid = serializers.UUIDField(format="hex_verbose", required=True)
