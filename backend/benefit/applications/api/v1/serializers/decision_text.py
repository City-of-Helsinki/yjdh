from rest_framework import serializers

from applications.models import AhjoDecisionText

REQUIRED_FIELD_ERROR = "This field is required."


class DecisionTextSerializer(serializers.ModelSerializer):
    class Meta:
        model = AhjoDecisionText
        exclude = ["application"]

    def validate(self, data):
        errors = {}

        decision_maker_name = data.get("decision_maker_name")
        if not decision_maker_name:
            errors["decision_maker_name"] = REQUIRED_FIELD_ERROR

        decision_maker_id = data.get("decision_maker_id")
        if not decision_maker_id:
            errors["decision_maker_id"] = REQUIRED_FIELD_ERROR

        signer_name = data.get("signer_name")
        if not signer_name:
            errors["signer_name"] = REQUIRED_FIELD_ERROR

        signer_id = data.get("signer_id")
        if not signer_id:
            errors["signer_id"] = REQUIRED_FIELD_ERROR

        if errors:
            raise serializers.ValidationError(errors)
        return data
