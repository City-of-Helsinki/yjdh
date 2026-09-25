from django.contrib.auth import get_user_model
from rest_framework import serializers

from common.permissions import ApproverPermission

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    is_approver = serializers.SerializerMethodField(
        "get_is_approver",
        help_text=(
            "Is the user an approver, i.e. a handler who is a member of one of the"
            " ADFS groups configured in the ADFS_APPROVER_GROUP_UUIDS setting. Only"
            " approvers may perform employer application payment-review status"
            " transitions."
        ),
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

    def get_is_approver(self, obj) -> bool:
        return ApproverPermission.has_user_permission(obj)
