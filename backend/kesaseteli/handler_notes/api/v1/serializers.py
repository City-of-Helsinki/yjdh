from django.contrib.contenttypes.models import ContentType
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from applications.enums import TimelineItemType
from handler_notes.enums import NoteType
from handler_notes.models import Note
from handler_notes.utils import get_note_target_model


class NoteSerializer(serializers.ModelSerializer):
    item_type = serializers.SerializerMethodField()
    author_username = serializers.SlugRelatedField(
        slug_field="username", read_only=True, source="author"
    )
    author_name = serializers.SerializerMethodField()
    target_type = serializers.CharField(required=False)
    target_id = serializers.UUIDField(required=False)

    class Meta:
        model = Note
        fields = [
            "id",
            "item_type",
            "content",
            "author_username",
            "author_name",
            "note_type",
            "is_important",
            "created_at",
            "modified_at",
            "target_type",
            "target_id",
        ]
        read_only_fields = [
            "id",
            "author_username",
            "author_name",
            "created_at",
            "modified_at",
        ]

    def _resolve_and_validate_target(self, target_type, target_id):
        """
        Validates target inputs and resolves them to a ContentType.
        """
        if not target_type or not target_id:
            raise serializers.ValidationError(
                {
                    "target_type": _(
                        "Both target_type and target_id must be "
                        "provided together, or both omitted."
                    )
                }
            )

        target_model = get_note_target_model(target_type)
        if not target_model:
            raise serializers.ValidationError({"target_type": _("Invalid target type")})

        return ContentType.objects.get_for_model(target_model)

    def _validate_target_on_update(self, target_type, target_id):
        """
        Validates target parameters during an update operation.
        Ensures target cannot be mutated/spoofed once the note is created.
        """
        if target_type is not None or target_id is not None:
            ct = self._resolve_and_validate_target(target_type, target_id)
            if ct != self.instance.content_type or target_id != self.instance.object_id:
                raise serializers.ValidationError(
                    {"target_type": _("Note target is read-only after creation.")}
                )

    def validate(self, attrs):
        """
        Validate target_type and target_id, resolve ContentType, and
        validate that notes targeting Attachments cannot be set as external messages.
        """
        note_type = attrs.get("note_type")
        target_type = attrs.pop("target_type", None)
        target_id = attrs.pop("target_id", None)

        if self.instance:
            if note_type is None:
                note_type = self.instance.note_type

            self._validate_target_on_update(target_type, target_id)

            target_model_name = self.instance.content_type.model
        else:
            if note_type is None:
                note_type = NoteType.INTERNAL

            ct = self._resolve_and_validate_target(target_type, target_id)
            attrs["content_type"] = ct
            attrs["object_id"] = target_id
            target_model_name = ct.model

        if target_model_name == "attachment" and note_type == NoteType.EXTERNAL_MESSAGE:
            raise serializers.ValidationError(
                {"note_type": _("Attachments cannot have external messages.")}
            )

        return attrs

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data["author"] = request.user

        return super().create(validated_data)

    def get_author_name(self, obj) -> str:
        if obj.author:
            return obj.author.get_full_name()
        return ""

    def get_item_type(self, obj) -> str:
        return TimelineItemType.NOTE

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["target_type"] = instance.content_type.model
        representation["target_id"] = str(instance.object_id)
        return representation
