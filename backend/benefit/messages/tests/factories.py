import factory
from messages.models import Message


class MessageFactory(factory.django.DjangoModelFactory):
    content = factory.Faker("sentence", nb_words=32)
    sender = factory.SubFactory("users.tests.factories.UserFactory")
    application = factory.SubFactory(
        "applications.tests.factories.HandlingApplicationFactory"
    )
    message_type = factory.Faker(
        "random_element", elements=[t[0] for t in Message.MESSAGE_TYPES]
    )

    class Meta:
        model = Message
