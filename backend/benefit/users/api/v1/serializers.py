from django.conf import settings
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from terms.api.v1.serializers import TermsOfServiceApprovalSerializer, TermsSerializer
from terms.enums import TermsType
from terms.models import Terms, TermsOfServiceApproval
from users.models import User
from users.utils import get_company_from_request


class UserSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(required=False)
    terms_of_service_approvals = TermsOfServiceApprovalSerializer(
        read_only=True,
        many=True,
        help_text=(
            "Terms of service approvals by this user. There could be many, if user has"
            " access to many companies."
        ),
    )

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "terms_of_service_approvals",
            "terms_of_service_approval_needed",
            "terms_of_service_in_effect",
            "is_staff",
        ]
        read_only_fields = [
            "id",
            "first_name",
            "last_name",
            "terms_of_service_approvals",
            "terms_of_service_approval_needed",
            "terms_of_service_in_effect",
            "is_staff",
        ]

    terms_of_service_in_effect = serializers.SerializerMethodField(
        "get_terms_of_service_in_effect",
        help_text=(
            "does the current user need to approve the terms of service currently in"
            " effectfor the current company"
        ),
    )

    @extend_schema_field(TermsSerializer())
    def get_terms_of_service_in_effect(self, obj):
        request = self.context.get("request")
        include_terms = (
            request.query_params.get("terms")
            if request and request.query_params
            else None
        )
        terms = Terms.objects.get_terms_in_effect(TermsType.TERMS_OF_SERVICE)
        if terms and include_terms:
            # If given the request in context, DRF will output the URL for FileFields
            context = {"request": self.context.get("request")}
            return TermsSerializer(terms, context=context).data
        else:
            return None

    def _current_user(self):
        request = self.context.get("request", None)
        if request:
            return request.user

    terms_of_service_approval_needed = serializers.SerializerMethodField(
        "is_terms_of_service_approval_needed",
        help_text=(
            "does the current user need to approve the terms of service currently in"
            " effectfor the current company"
        ),
    )

    def is_terms_of_service_approval_needed(self, obj):
        if settings.NEXT_PUBLIC_MOCK_FLAG or (
            hasattr(obj, "is_handler") and obj.is_handler()
        ):
            return False
        return TermsOfServiceApproval.terms_approval_needed(
            obj, get_company_from_request(self.context.get("request"))
        )
