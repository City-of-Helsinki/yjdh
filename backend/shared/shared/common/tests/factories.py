import factory
from django.contrib.auth import get_user_model


class UserFactory(factory.django.DjangoModelFactory):
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    username = factory.Faker("user_name")
    email = factory.Faker("email")

    class Meta:
        model = get_user_model()


class HandlerUserFactory(UserFactory):
    """
    User who passes HandlerPermission i.e. active staff and/or superuser user.
    """

    is_active = True
    is_staff = factory.Faker("boolean")
    is_superuser = factory.Maybe("is_staff", factory.Faker("boolean"), True)


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
