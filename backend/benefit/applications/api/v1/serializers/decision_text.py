from rest_framework import serializers

from applications.models import AhjoDecisionText


class DecisionTextSerializer(serializers.ModelSerializer):
    class Meta:
        model = AhjoDecisionText
        exclude = ["application"]

    def validate(self, data):
        errors = {}

        decision_maker_name = data.get("decision_maker_name")
        if not decision_maker_name:
            errors["decision_maker_name"] = "This field is required."

        decision_maker_id = data.get("decision_maker_id")
        if not decision_maker_id:
            errors["decision_maker_id"] = "This field is required."

        if errors:
            raise serializers.ValidationError(errors)
        return data
