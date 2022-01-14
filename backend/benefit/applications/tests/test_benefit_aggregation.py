import itertools
from datetime import date
from decimal import Decimal

import pytest
from applications.api.v1.serializers import ApplicantApplicationSerializer
from applications.enums import BenefitType
from applications.models import Application
from applications.tests.conftest import *  # noqa
from applications.tests.factories import DecidedApplicationFactory
from applications.tests.test_applications_api import get_detail_url
from calculator.models import PreviousBenefit
from calculator.tests.factories import PreviousBenefitFactory
from common.tests.conftest import *  # noqa
from companies.tests.conftest import *  # noqa
from django.utils import translation
from helsinkibenefit.tests.conftest import *  # noqa
from terms.tests.conftest import *  # noqa

APPRENTICESHIP = True
NO_APPRENTICESHIP = False
NO_WARNINGS = None


@pytest.mark.parametrize(
    "previous_benefits, benefit_type, apprenticeship_program, expected_warning, months_used, months_remaining",
    [
        (
            [
                (
                    Application,
                    "2020-01-01",
                    "2020-12-31",
                )
            ],
            BenefitType.SALARY_BENEFIT,
            NO_APPRENTICESHIP,
            "Benefit can not be granted before 24-month waiting period expires",
            12,
            0,
        ),  # 12 months of benefit used, 24 months not elapsed
        (
            [
                (
                    PreviousBenefit,
                    "2020-01-01",
                    "2020-12-31",
                )
            ],
            BenefitType.SALARY_BENEFIT,
            NO_APPRENTICESHIP,
            "Benefit can not be granted before 24-month waiting period expires",
            12,
            0,
        ),  # 12 months of benefit used, 24 months not elapsed
        (
            [
                (
                    Application,
                    "2020-01-01",
                    "2020-12-31",
                )
            ],
            BenefitType.SALARY_BENEFIT,
            APPRENTICESHIP,
            NO_WARNINGS,
            12,
            None,
        ),  # As an exception, apprenticeship may be granted
        (
            [
                (
                    PreviousBenefit,
                    "2020-01-01",
                    "2020-12-31",
                )
            ],
            BenefitType.SALARY_BENEFIT,
            NO_APPRENTICESHIP,
            "Benefit can not be granted before 24-month waiting period expires",
            12,
            0,
        ),  # 12 months of benefit used, 24 months not elapsed
        (
            [
                (
                    Application,
                    "2020-01-01",
                    "2020-12-31",
                )
            ],
            BenefitType.EMPLOYMENT_BENEFIT,
            NO_APPRENTICESHIP,
            "Benefit can not be granted before 24-month waiting period expires",
            12,
            0,
        ),  # same as above, employment_benefit/salary_benefit are treated the same
        (
            [
                (
                    Application,
                    "2019-01-01",
                    "2019-12-31",
                )
            ],
            BenefitType.EMPLOYMENT_BENEFIT,
            NO_APPRENTICESHIP,
            "Benefit can not be granted before 24-month waiting period expires",
            12,
            0,
        ),  # 12 months of benefit used, 24 months not elapsed
        (
            [
                (
                    Application,
                    "2018-01-01",
                    "2018-12-31",
                )
            ],
            BenefitType.EMPLOYMENT_BENEFIT,
            NO_APPRENTICESHIP,
            NO_WARNINGS,
            0,
            12,
        ),  # 24 months is elapsed
        (
            [
                (
                    Application,
                    "2020-01-01",
                    "2020-06-30",
                )
            ],
            BenefitType.SALARY_BENEFIT,
            NO_APPRENTICESHIP,
            NO_WARNINGS,
            6,
            6,
        ),  # only 6 months of benefit used
        (
            [
                (
                    Application,
                    "2020-01-01",
                    "2020-07-01",
                ),
            ],
            BenefitType.SALARY_BENEFIT,
            NO_APPRENTICESHIP,
            "Benefit can not be granted before 24-month waiting period expires",
            Decimal("6.03"),
            Decimal("5.97"),
        ),
        # 6 months + 1 day of benefit used, one day too much for a new 6-month benefit
        (
            [
                (
                    Application,
                    "2019-07-01",
                    "2019-12-31",
                ),
                (
                    Application,
                    "2020-07-01",
                    "2020-12-31",
                ),
            ],
            BenefitType.SALARY_BENEFIT,
            NO_APPRENTICESHIP,
            "Benefit can not be granted before 24-month waiting period expires",
            12,
            0,
        ),  # 24 months not elapsed
        (
            [
                (
                    PreviousBenefit,
                    "2019-07-01",
                    "2019-12-31",
                ),
                (
                    Application,
                    "2020-07-01",
                    "2020-12-31",
                ),
            ],
            BenefitType.SALARY_BENEFIT,
            NO_APPRENTICESHIP,
            "Benefit can not be granted before 24-month waiting period expires",
            12,
            0,
        ),  # 24 months not elapsed - both Application and PreviousBenefit
        (
            [
                (
                    PreviousBenefit,
                    "2019-07-01",
                    "2019-12-31",
                ),
                (
                    Application,
                    "2020-07-01",
                    "2020-12-31",
                ),
            ],
            BenefitType.SALARY_BENEFIT,
            APPRENTICESHIP,
            NO_WARNINGS,
            12,
            None,
        ),  # 24 months not elapsed - but apprenticeship may be granted
        (
            [
                (
                    Application,
                    "2019-01-01",
                    "2019-06-30",
                ),
                (
                    Application,
                    "2020-07-01",
                    "2020-12-31",
                ),
            ],
            BenefitType.SALARY_BENEFIT,
            NO_APPRENTICESHIP,
            "Benefit can not be granted before 24-month waiting period expires",
            12,
            0,
        ),  # 24 months not elapsed
        (
            [
                (
                    Application,
                    "2018-01-01",
                    "2018-06-30",
                ),
                (
                    Application,
                    "2018-07-01",
                    "2018-12-31",
                ),
            ],
            BenefitType.SALARY_BENEFIT,
            NO_APPRENTICESHIP,
            NO_WARNINGS,
            0,
            12,
        ),  # 24 months elapsed
        (
            [
                (
                    Application,
                    "2017-07-01",
                    "2018-06-30",
                ),
                (
                    Application,
                    "2020-07-01",
                    "2020-12-31",
                ),
            ],
            BenefitType.SALARY_BENEFIT,
            NO_APPRENTICESHIP,
            NO_WARNINGS,
            6,
            6,
        ),
        # 24-month gap in past benefits so the benefit from 2017-2018 is not included and application is valid
        (
            [
                (
                    PreviousBenefit,
                    "2018-01-01",
                    "2018-03-31",
                ),
                (
                    Application,
                    "2019-01-01",
                    "2019-03-31",
                ),
                (
                    Application,
                    "2020-01-01",
                    "2020-03-31",
                ),
            ],
            BenefitType.SALARY_BENEFIT,
            NO_APPRENTICESHIP,
            "Benefit can not be granted before 24-month waiting period expires",
            9,
            3,
        ),
        # several previously granted benefits that don't have a 24-month gap
        (
            [
                (
                    Application,
                    "2021-06-01",
                    "2021-08-31",
                )
            ],
            BenefitType.EMPLOYMENT_BENEFIT,
            NO_APPRENTICESHIP,
            "There's already an accepted application or previous benefit with overlapping date range",
            3,
            9,
        ),  # a benefit has been previously granted that overlaps the new application
    ],
)
def test_application_with_previously_accepted_applications_and_previous_benefits(
    api_client,
    application,
    previous_benefits,
    benefit_type,
    apprenticeship_program,
    months_used,
    months_remaining,
    expected_warning,
):
    # the type of the previous benefit and the apprenticeship_program value do not matter when
    # calculating the remaining available benefit time (Teams discussion)
    past_benefit_type_iterator = itertools.cycle([True, False])
    # also, the apprenticeship_program setting in _past_ benefits does not matter to calculation, so
    # alternate it to produce more testable combinations
    past_apprenticeship_iterator = itertools.cycle([True, False])
    for class_name, previous_start_date, previous_end_date in previous_benefits:
        # previous, already granted benefits for the same employee+company
        if class_name == Application:
            decided_application = DecidedApplicationFactory()
            decided_application.benefit_type = next(past_benefit_type_iterator)
            decided_application.apprenticeship_program = next(
                past_apprenticeship_iterator
            )
            decided_application.start_date = date.fromisoformat(previous_start_date)
            decided_application.end_date = date.fromisoformat(previous_end_date)
            decided_application.company = application.company
            decided_application.save()
            decided_application.employee.social_security_number = (
                application.employee.social_security_number
            )
            decided_application.employee.save()
        elif class_name == PreviousBenefit:
            # entries manually entered by application handlers
            PreviousBenefitFactory(
                company=application.company,
                social_security_number=application.employee.social_security_number,
                start_date=date.fromisoformat(previous_start_date),
                end_date=date.fromisoformat(previous_end_date),
            )
        else:
            assert False, "unexpected"

    application.apprenticeship_program = apprenticeship_program
    application.start_date = date(2021, 1, 1)
    application.start_date = date(2021, 6, 30)
    application.save()

    response_before_update = api_client.get(get_detail_url(application))
    assert (
        response_before_update.data["former_benefit_info"]["months_used"] == months_used
    )
    assert (
        response_before_update.data["former_benefit_info"]["months_remaining"]
        == months_remaining
    )

    data = ApplicantApplicationSerializer(application).data

    data["benefit_type"] = benefit_type
    data["start_date"] = date(2021, 7, 1)
    data["end_date"] = date(2021, 12, 31)
    data["pay_subsidy_granted"] = True
    data["pay_subsidy_percent"] = 50

    with translation.override("en"):
        response = api_client.put(
            get_detail_url(application),
            data,
        )
        assert response.status_code == 200
        assert response.data["start_date"] == "2021-07-01"
        assert response.data["end_date"] == "2021-12-31"
        if expected_warning:
            assert expected_warning in response.data["warnings"]["former_benefits"][0]
            assert len(response.data["warnings"]["former_benefits"]) == 1
        else:
            assert "former_benefits" not in response.data["warnings"]
