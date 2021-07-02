import factory
from django.contrib.auth import get_user_model


class UserFactory(factory.django.DjangoModelFactory):
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    username = factory.Sequence(lambda n: f"{factory.Faker('user_name')} {n}")
    email = factory.Faker("email")

    class Meta:
        model = get_user_model()
