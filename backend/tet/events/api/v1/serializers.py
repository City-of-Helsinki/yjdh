from rest_framework.serializers import (
    CharField,
    DictField,
    EmailField,
    ListField,
    Serializer,
    URLField,
)


class CustomDataSerializer(Serializer):
    spots = CharField(max_length=3)
    org_name = CharField(max_length=250)
    contact_email = EmailField(allow_blank=True)
    contact_phone = CharField(max_length=30, allow_blank=True)
    contact_last_name = CharField(max_length=250, allow_blank=True)
    contact_first_name = CharField(max_length=250, allow_blank=True)


class TetUpsertEventSerializer(Serializer):
    name = DictField(child=CharField(max_length=200))
    description = DictField(
        child=CharField(max_length=3000, allow_blank=True), allow_empty=True
    )
    location = DictField(child=URLField())
    keywords = ListField(child=DictField(child=URLField()), min_length=0, max_length=30)
    images = ListField(min_length=0, max_length=1)  # TODO add argument child
    start_time = CharField(max_length=30, allow_null=True)
    end_time = CharField(max_length=30, allow_null=True)
    date_published = CharField(max_length=30, allow_null=True)
    publication_status = CharField(max_length=30, allow_null=True, required=False)
    custom_data = CustomDataSerializer()
    in_language = ListField(
        child=DictField(child=URLField()), min_length=0, max_length=30
    )
