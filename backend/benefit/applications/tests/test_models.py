from applications.models import Application
from helsinkibenefit.tests.conftest import *  # noqa


def test_application_model(application):
    assert Application.objects.count() == 1
