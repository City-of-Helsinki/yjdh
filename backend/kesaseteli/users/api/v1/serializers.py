from django.contrib.auth import get_user_model
from rest_framework import serializers

from common.permissions import ApproverPermission

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    is_approver = serializers.SerializerMethodField(
        "get_is_approver", help_text=("Is the user an approver?")
    )

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "is_staff",
            "is_approver",
        ]
        read_only_fields = fields

    def get_is_approver(self, user: User | None) -> bool:
        return ApproverPermission.has_user_permission(user)
