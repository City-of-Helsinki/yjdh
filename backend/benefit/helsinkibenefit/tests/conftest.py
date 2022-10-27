import pytest
from django.core.management import call_command


@pytest.fixture(autouse=True)
def autouse_django_db(db, django_db_setup, django_db_blocker):
    pass


@pytest.fixture(scope="session")
def django_db_setup(django_db_setup, django_db_blocker):
    with django_db_blocker.unblock():
        call_command("loaddata", "groups.json")


@pytest.fixture(scope="session")
def django_db_modify_db_settings():
    pass
