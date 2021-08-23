import factory
import pytest
from applications.enums import BenefitType
from applications.tests.factories import (
    ApplicationBatchFactory,
    ApplicationFactory,
    EmployeeFactory,
)


@pytest.fixture
def application():
    with factory.Faker.override_default_locale("fi_FI"):
        return ApplicationFactory()


@pytest.fixture
def application_batch():
    with factory.Faker.override_default_locale("fi_FI"):
        return ApplicationBatchFactory()


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
    application.association_has_business_activities = False
    application.de_minimis_aid_set.all().delete()
    return application


@pytest.fixture
def employee():
    with factory.Faker.override_default_locale("fi_FI"):
        return EmployeeFactory()
