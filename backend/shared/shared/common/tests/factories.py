import factory
from django.contrib.auth import get_user_model


class UserFactory(factory.django.DjangoModelFactory):
    """
    Create a Django user with a unique username
    """

    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    email = factory.Faker("email")

    username_base = factory.Faker("user_name")
    username_suffix = factory.Faker(
        "password", length=6, special_chars=False, upper_case=False
    )
    username = factory.LazyAttribute(
        lambda p: "{}_{}".format(p.username_base, p.username_suffix)
    )

    class Meta:
        model = get_user_model()
        exclude = ("username_base", "username_suffix")


class DuplicateAllowingUserFactory(UserFactory):
    """
    Create or get a Django user with a possibly duplicated username
    """

    class Meta:
        model = get_user_model()
        django_get_or_create = ("username",)


class HandlerUserFactory(UserFactory):
    """
    User who passes HandlerPermission i.e. active staff and/or superuser user.
    """

    is_active = True
    is_staff = factory.Faker("boolean")
    is_superuser = factory.Maybe("is_staff", factory.Faker("boolean"), True)  # type: ignore


class StaffUserFactory(UserFactory):
    """
    Active staff user.
    """

    is_active = True
    is_staff = True


class SuperuserFactory(UserFactory):
    """
    Active superuser user.
    """

    is_active = True
    is_superuser = True


class StaffSuperuserFactory(UserFactory):
    """
    Active staff and superuser user.
    """

    is_active = True
    is_staff = True
    is_superuser = True


class HelsinkiProfileUserFactory(UserFactory):
    """
    Helsinki-profile linked users' usernames are UUID's.
    """

    username = factory.Faker("uuid4")
