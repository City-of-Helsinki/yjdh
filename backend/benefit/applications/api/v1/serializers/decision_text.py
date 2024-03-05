from rest_framework import serializers

from applications.models import AhjoDecisionText


class DecisionTextSerializer(serializers.ModelSerializer):
    class Meta:
        model = AhjoDecisionText
        exclude = ["application"]
