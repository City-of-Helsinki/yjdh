import pytest

from companies.models import Company
from companies.tests.factories import CompanyFactory


@pytest.mark.django_db
def test_company_model():
    CompanyFactory()
    assert Company.objects.count() == 1
