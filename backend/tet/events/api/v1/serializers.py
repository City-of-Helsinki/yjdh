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
    contact_email = EmailField()
    contact_phone = CharField(max_length=30)
    contact_language = CharField(max_length=5)
    contact_last_name = CharField(max_length=250)
    contact_first_name = CharField(max_length=250)


class TetUpsertEventSerializer(Serializer):
    name = DictField(child=CharField(max_length=200))
    description = DictField(child=CharField(max_length=2000))
    location = DictField(child=URLField())
    keywords = ListField(child=DictField(child=URLField()), min_length=1, max_length=30)
    start_time = CharField(max_length=30)
    end_time = CharField(max_length=30, allow_null=True)
    date_published = CharField(max_length=30, allow_null=True)
    custom_data = CustomDataSerializer()
