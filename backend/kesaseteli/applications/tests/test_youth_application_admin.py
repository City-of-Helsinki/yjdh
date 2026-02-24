import pytest
from django.contrib.admin.sites import AdminSite

from applications.admin import YouthApplicationAdmin
from applications.models import YouthApplication
from common.tests.factories import YouthApplicationFactory


@pytest.fixture
def youth_application_admin():
    return YouthApplicationAdmin(YouthApplication, AdminSite())


@pytest.mark.django_db
def test_masked_social_security_number(youth_application_admin):
    # Test with valid SSN
    app = YouthApplicationFactory.build(social_security_number="010101-1234")
    assert youth_application_admin.masked_social_security_number(app) == "******1234"

    # Test with another valid SSN
    app = YouthApplicationFactory.build(social_security_number="311299A9876")
    assert youth_application_admin.masked_social_security_number(app) == "******9876"


@pytest.mark.django_db
def test_masked_social_security_number_empty(youth_application_admin):
    # Test with empty SSN
    app = YouthApplicationFactory.build(social_security_number="")
    assert youth_application_admin.masked_social_security_number(app) == ""

    # Test with None SSN
    app = YouthApplicationFactory.build(social_security_number=None)
    assert youth_application_admin.masked_social_security_number(app) == ""


@pytest.mark.django_db
def test_masked_social_security_number_short(youth_application_admin):
    # Test with short SSN (should verify behavior, might just take last 4)
    app = YouthApplicationFactory.build(social_security_number="123")
    assert youth_application_admin.masked_social_security_number(app) == "******123"
