from rest_framework import serializers

class TetPostingSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)

