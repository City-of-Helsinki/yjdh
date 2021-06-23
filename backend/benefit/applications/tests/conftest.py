import pytest
from applications.enums import BenefitType
from applications.tests.factories import ApplicationFactory, EmployeeFactory


@pytest.fixture
def application():
    return ApplicationFactory()


@pytest.fixture
def association_application():
    """
    :return: A valid application by an association
    """
    application = ApplicationFactory()
    application.company.company_form = "association"  # TODO: fix with actual value
    application.company.save()
    application.benefit_type = BenefitType.SALARY_BENEFIT
    application.de_minimis_aid = None
    application.de_minimis_aid_set.all().delete()
    return application


@pytest.fixture
def employee():
    return EmployeeFactory()
