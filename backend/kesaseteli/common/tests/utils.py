from datetime import datetime, timezone

from dateutil.relativedelta import relativedelta
from django.test import Client

from applications.models import Company
from common.tests.faker import get_faker
from shared.common.tests.utils import create_finnish_social_security_number


def get_random_social_security_number_for_year(year: int) -> str:
    """
    Create a random non-temporary Finnish social security number for the given year
    """
    start_of_year: datetime = datetime(year=year, month=1, day=1, tzinfo=timezone.utc)
    return create_finnish_social_security_number(
        birthdate=get_faker()
        .date_time_between(
            start_of_year,
            start_of_year + relativedelta(years=1, seconds=-1),  # Inclusive range
            tzinfo=timezone.utc,
        )
        .date(),
        individual_number=get_faker().pyint(2, 899),  # Inclusive range
    )


def set_company_business_id_to_client(company: Company, client: Client) -> None:
    """
    Set company's business ID to client's session so the given company is fetched when
    calling companies.services.get_or_create_company_using_organization_roles
    """
    session = client.session
    session.update({"organization_roles": {"identifier": company.business_id}})
    session.save()
