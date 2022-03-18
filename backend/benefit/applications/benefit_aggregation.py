import operator
from dataclasses import dataclass, field
from decimal import Decimal
from itertools import chain
from typing import List, Optional, Union

from applications.enums import ApplicationStatus
from applications.models import Application
from calculator.models import PreviousBenefit
from common.utils import date_range_overlap, duration_in_months, pairwise
from dateutil.relativedelta import relativedelta
from django.utils.text import format_lazy
from django.utils.translation import gettext_lazy as _


@dataclass
class FormerBenefitInfo:
    warnings: List[str] = field(default_factory=list)
    months_used: Optional[
        Decimal
    ] = None  # None is used if employee info is not entered yet
    months_remaining: Optional[Decimal] = None  # None means that there is no limit


# apprenticeship is a special case
BENEFIT_WAITING_PERIOD_MONTHS = 24


def get_former_benefit_info(
    application,
    company,
    social_security_number,
    start_date,
    end_date,
    apprenticeship_program,
):
    # the application field values are separate parameters, because validation is done
    # before assigning values, and if a new Application is being created, an Application doesn't yet exist when
    # the rest framework does the validation.
    # The Application parameter is only used to ensure that the application being validated isn't validated
    # against itself.

    former_benefit_info = FormerBenefitInfo()

    if not social_security_number or not end_date:
        # the employee info hasn't been entered yet
        return former_benefit_info

    recent_benefits = _get_benefits_relevant_for_validation(
        _get_past_benefits(application, company, social_security_number, end_date),
        start_date,
    )

    former_benefit_info.warnings.extend(
        _get_benefit_overlap_warnings(recent_benefits, start_date, end_date)
    )

    former_benefit_info.months_used = sum(
        benefit.duration_in_months for benefit in recent_benefits
    )
    if apprenticeship_program:
        # Kanslia Helsinki-lisä Teams discussion 2021-12-09: there's no upper limit defined for
        # sequentially granted apprenticeship benefits
        former_benefit_info.months_remaining = None
    else:
        former_benefit_info.months_remaining = max(
            Decimal(0), Application.BENEFIT_MAX_MONTHS - former_benefit_info.months_used
        )

    if (
        not apprenticeship_program
        and duration_in_months(start_date, end_date)
        > former_benefit_info.months_remaining
    ):
        # granting this benefit would exceed the limit
        former_benefit_info.warnings.append(
            _("Benefit can not be granted before 24-month waiting period expires")
        )
    return former_benefit_info


def _get_past_benefits(
    application, company, social_security_number, end_date
) -> List[Union[PreviousBenefit, Application]]:
    """
    Return a list containing two types of objects:
    * PreviousBenefits
    * Applications that are in ACCEPTED status

    The list is sorted according to start_date in descending order.

    PreviousBenefit and Application objects these have these in common:
    * start_date and end_date fields
    * duration_in_months property
    """

    # The waiting time starts at the end of the latest benefit period granted.
    previously_accepted_applications = Application.objects.filter(
        employee__social_security_number=social_security_number,
        company=company,
        status=ApplicationStatus.ACCEPTED,
        start_date__lte=end_date,  # catch also overlapping benefits
    )

    if application:
        previously_accepted_applications = previously_accepted_applications.exclude(
            pk=application.pk
        )

    previous_benefits = PreviousBenefit.objects.filter(
        social_security_number=social_security_number,
        company=company,
        start_date__lte=end_date,
    )
    return sorted(
        chain(previously_accepted_applications, previous_benefits),
        key=operator.attrgetter("start_date"),
        reverse=True,
    )  # most recent first


def _get_benefits_relevant_for_validation(past_benefits, start_date):
    """
    :param past_benefits: list of PreviousBenefit and/or Application objects,
    sorted according to start_date in descending order.

    :param start_date: start_date of an application

    :return: A new list, containing only those entries that are relevant for validating a new application
    starting on start_date.
    """
    if not past_benefits:
        return []
    most_recent_benefit = past_benefits[0]
    if not most_recent_benefit or (
        most_recent_benefit.end_date
        < start_date - relativedelta(months=BENEFIT_WAITING_PERIOD_MONTHS)
    ):
        # at least BENEFIT_WAITING_PERIOD_MONTHS elapsed since a Helsinki benefit was granted
        # for this employee last time.
        return []

    # scroll back previous benefits until we find a gap of BENEFIT_WAITING_PERIOD_MONTHS
    applicable_benefits = [most_recent_benefit]
    for old_benefit, older_benefit in pairwise(past_benefits):
        # on the first round of loop, old_benefit == most_recent_benefit, which already is in
        # applicable_benefits
        if (
            older_benefit.end_date + relativedelta(months=BENEFIT_WAITING_PERIOD_MONTHS)
            < old_benefit.start_date
        ):
            break
        applicable_benefits.append(older_benefit)
    return applicable_benefits


def _get_benefit_overlap_warnings(past_benefits, start_date, end_date):
    warnings = []
    for benefit in past_benefits:
        if date_range_overlap(
            start_date, end_date, benefit.start_date, benefit.end_date
        ):
            warnings.append(
                format_lazy(
                    _(
                        "There's already an accepted application with overlapping date range"
                    ),
                    start_date=benefit.start_date,
                    end_date=benefit.end_date,
                )
            )
    return warnings
