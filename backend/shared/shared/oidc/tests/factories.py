import factory
from django.contrib.auth import get_user_model
from django.utils import timezone

from shared.oidc.models import EAuthorizationProfile, OIDCProfile


class UserFactory(factory.django.DjangoModelFactory):
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    username = factory.Sequence(lambda n: f"{factory.Faker('user_name')} {n}")
    email = factory.Faker("email")

    class Meta:
        model = get_user_model()


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
