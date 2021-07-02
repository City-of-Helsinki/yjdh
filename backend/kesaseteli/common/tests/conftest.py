import pytest
from django.contrib.auth.models import Permission
from rest_framework.test import APIClient
from shared.oidc.tests.conftest import *  # noqa

from applications.enums import ApplicationStatus
from common.tests.factories import ApplicationFactory, CompanyFactory, UserFactory


@pytest.fixture
def company(eauthorization_profile):
    company = CompanyFactory(eauth_profile=eauthorization_profile)
    return company


@pytest.fixture
def application(company):
    return ApplicationFactory(status=ApplicationStatus.DRAFT, company=company)


@pytest.fixture
def user_with_profile(oidc_profile, eauthorization_profile):
    user = UserFactory(oidc_profile=oidc_profile)

    eauthorization_profile.oidc_profile = oidc_profile
    eauthorization_profile.save()

    return user


@pytest.fixture
def api_client(user_with_profile):
    permissions = Permission.objects.all()
    user_with_profile.user_permissions.set(permissions)
    client = APIClient()
    client.force_authenticate(user_with_profile)
    return client


@pytest.fixture
def unauthenticated_api_client():
    return APIClient()
