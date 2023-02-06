import factory

from messages.models import Message, MessageType


class MessageFactory(factory.django.DjangoModelFactory):
    content = factory.Faker("sentence", nb_words=32)
    sender = factory.SubFactory(
        "shared.common.tests.factories.HelsinkiProfileUserFactory"
    )
    application = factory.SubFactory(
        "applications.tests.factories.HandlingApplicationFactory"
    )
    message_type = factory.Faker(
        "random_element", elements=[t[0] for t in MessageType.choices]
    )

    class Meta:
        model = Message
