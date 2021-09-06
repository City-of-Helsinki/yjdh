import factory
import pytest
from applications.enums import BenefitType
from applications.services.talpa_integration import TalpaService
from applications.tests.factories import (
    ApplicationBatchFactory,
    ApplicationFactory,
    DecidedApplicationFactory,
    EmployeeFactory,
)
from companies.tests.conftest import *  # noqa


@pytest.fixture
def anonymous_application():
    with factory.Faker.override_default_locale("fi_FI"):
        return ApplicationFactory()


@pytest.fixture
def decided_application():
    with factory.Faker.override_default_locale("fi_FI"):
        return DecidedApplicationFactory()


@pytest.fixture
def application_batch():
    with factory.Faker.override_default_locale("fi_FI"):
        return ApplicationBatchFactory()


@pytest.fixture
def talpa_service(application_batch):
    return TalpaService(application_batch)


@pytest.fixture
def talpa_service_with_one_application(talpa_service):
    talpa_service.get_applications().first().delete()
    assert talpa_service.get_applications().count() == 1
    return talpa_service


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


@pytest.fixture
def application(mock_get_organisation_roles_and_create_company):
    with factory.Faker.override_default_locale("fi_FI"):
        app = ApplicationFactory()
        app.company = mock_get_organisation_roles_and_create_company
        app.save()
        return app
