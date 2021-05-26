import factory
from django.utils import timezone

from applications.tests.factories import UserFactory
from oidc.models import OIDCProfile


class OIDCProfileFactory(factory.django.DjangoModelFactory):
    user = factory.SubFactory(UserFactory)
    id_token = factory.Faker("md5")

    access_token = factory.Faker("md5")
    access_token_expires = factory.Faker(
        "future_datetime", tzinfo=timezone.get_current_timezone()
    )

    refresh_token = factory.Faker("md5")
    refresh_token_expires = factory.Faker(
        "future_datetime", tzinfo=timezone.get_current_timezone()
    )

    class Meta:
        model = OIDCProfile
