import factory
from django.contrib.contenttypes.models import ContentType
from factory.django import DjangoModelFactory

from common.tests.factories import YouthApplicationFactory
from handler_notes.enums import NoteType
from handler_notes.models import Note
from shared.common.tests.factories import UserFactory


class NoteFactory(DjangoModelFactory):
    class Meta:
        model = Note

    author = factory.SubFactory(UserFactory)
    content = factory.Faker("text")
    note_type = NoteType.INTERNAL
    is_important = False

    @factory.lazy_attribute
    def content_object(self):
        return YouthApplicationFactory()

    @factory.lazy_attribute
    def object_id(self):
        return self.content_object.id

    @factory.lazy_attribute
    def content_type(self):
        return ContentType.objects.get_for_model(self.content_object)
