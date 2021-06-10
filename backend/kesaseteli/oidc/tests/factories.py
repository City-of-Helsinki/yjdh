import factory
from django.utils import timezone

from applications.tests.factories import UserFactory
from oidc.models import EAuthorizationProfile, OIDCProfile


class AbstractProfileFactory(factory.django.DjangoModelFactory):
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
        abstract = True


class OIDCProfileFactory(AbstractProfileFactory):
    user = factory.SubFactory(UserFactory)

    class Meta:
        model = OIDCProfile


class EAuthorizationProfileFactory(AbstractProfileFactory):
    oidc_profile = factory.SubFactory(OIDCProfileFactory)

    class Meta:
        model = EAuthorizationProfile
