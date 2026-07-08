from unittest.mock import Mock, patch

import pytest
from django.contrib.admin.sites import AdminSite
from django.contrib.messages.storage.fallback import FallbackStorage
from django.test import RequestFactory
from django.urls import reverse

from common.tests.factories import CompanyFactory
from companies.admin import CompanyAdmin
from companies.models import Company


@pytest.fixture
def company_admin():
    return CompanyAdmin(Company, AdminSite())


@pytest.mark.django_db
def test_update_from_ytj_action_success(company_admin):
    company = CompanyFactory()

    factory = RequestFactory()
    request = factory.post(reverse("admin:companies_company_changelist"))
    request.user = Mock()

    request.session = Mock()
    storage = FallbackStorage(request)
    request._messages = storage

    queryset = Company.objects.filter(pk=company.pk)

    with patch("companies.admin.update_company_from_ytj") as mock_update:
        company_admin.update_from_ytj(request, queryset)
        mock_update.assert_called_once_with(company, raise_exception=True)

    msgs = [msg.message for msg in storage]
    assert any("Successfully updated 1 company from YTJ." in m for m in msgs)


@pytest.mark.django_db
def test_update_from_ytj_action_failure(company_admin):
    company = CompanyFactory()

    factory = RequestFactory()
    request = factory.post(reverse("admin:companies_company_changelist"))
    request.user = Mock()

    request.session = Mock()
    storage = FallbackStorage(request)
    request._messages = storage

    queryset = Company.objects.filter(pk=company.pk)

    with patch(
        "companies.admin.update_company_from_ytj", side_effect=Exception("API Error")
    ):
        company_admin.update_from_ytj(request, queryset)

    msgs = [msg.message for msg in storage]
    assert any("Failed to update 1 company from YTJ." in m for m in msgs)
