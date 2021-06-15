from applications.models import Application, Employee
from helsinkibenefit.tests.conftest import *  # noqa


def test_application_model(application):
    assert Application.objects.count() == 1


def test_employee_model(employee):
    assert Employee.objects.count() == 1
    assert Application.objects.count() == 1
