from applications.enums import ApplicationStatus
from applications.models import Application
from django.utils.translation import gettext_lazy as _
from messages.models import Message, MessageType
from rest_framework import serializers
from rest_framework.exceptions import NotFound, PermissionDenied
from users.utils import get_company_from_request, get_request_user_from_context


class MessageSerializer(serializers.ModelSerializer):
    message_type = serializers.ChoiceField(
        choices=MessageType.choices, help_text="Type of the message"
    )

    class Meta:
        model = Message
        fields = [
            "id",
            "created_at",
            "modified_at",
            "content",
            "message_type",
        ]

    def validate(self, data):
        request = self.context.get("request")
        user = get_request_user_from_context(self)
        application_id = self.context["view"].kwargs["application_pk"]

        try:
            application = Application.objects.get(id=application_id)
        except Application.DoesNotExist:
            raise NotFound(_("Application not found"))

        if not user.is_handler():
            company = get_company_from_request(request)
            if company != application.company:
                raise PermissionDenied(_("You are not allowed to do this action"))
            if application.status != ApplicationStatus.HANDLING:
                raise serializers.ValidationError(
                    _(
                        "Cannot do this action because "
                        "application is not in handling status"
                    )
                )
            if data["message_type"] != MessageType.APPLICANT_MESSAGE:
                raise serializers.ValidationError(
                    _("Applicant is not allowed to do this action")
                )
        elif data["message_type"] == MessageType.APPLICANT_MESSAGE:
            raise serializers.ValidationError(
                _("Handler is not allowed to do this action")
            )

        if request.method == "POST":
            # Only set sender and application when creating message
            data["application"] = application
            data["sender"] = user

        return data


class NoteSerializer(MessageSerializer):
    sender = serializers.SerializerMethodField(
        "get_sender_name", help_text="Full name of person who create the note"
    )

    def get_sender_name(self, obj):
        return " ".join([obj.sender.first_name, obj.sender.last_name])

    class Meta(MessageSerializer.Meta):
        fields = MessageSerializer.Meta.fields + ["sender"]
