from datetime import datetime, timezone

from dateutil.relativedelta import relativedelta

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
