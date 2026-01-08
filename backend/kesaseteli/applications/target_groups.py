"""
Target Groups Module

This module defines the logic for different "target groups" of applicants who are
eligible for the Youth Summer Voucher. A target group represents a specific segment of
the youth population (e.g., 9th graders, secondary students) with specific eligibility
criteria.

Classes:
- AbstractTargetGroup: The base class defining the interface for all target groups.
- NinthGraderTargetGroup: Implementations for 9th graders (16yo, Helsinki resident).
- UpperSecondaryFirstYearTargetGroup: Implementations for secondary students.

Usage:
These classes are used to:
1. Validate if a youth application is eligible for a voucher (`is_valid`).
2. Define available options for SummerVoucherConfiguration in the admin panel.
3. Provide localized names for the UI.

To add a new target group:
1. Create a new subclass of `AbstractTargetGroup`.
2. Define a unique `identifier` string (used in database) and a localized `name`.
3. Implement the `is_valid` method with specific business logic.
4. The system will automatically pick up the new class via `__subclasses__()`.

WARNING:
The `identifier` defined in target group subclasses is stored directly in the database
(specifically in `YouthSummerVoucher` and `EmployerSummerVoucher` tables).
Changing an existing identifier will break data integrity for existing records.
If you need to change an identifier, a data migration is required to update existing
records.
"""

from abc import ABC, abstractmethod
from typing import List, Tuple, TYPE_CHECKING

from django.utils.translation import gettext_lazy as _

if TYPE_CHECKING:
    from applications.models import YouthApplication


class AbstractTargetGroup(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        """
        User facing name of the target group.
        """

    @property
    @abstractmethod
    def identifier(self) -> str:
        """
        Unique identifier for the target group (saved in database).
        """

    @abstractmethod
    def is_valid(self, application: "YouthApplication") -> bool:
        """
        Check if the given application belongs to this target group.
        """

    def get_age_by_year(self, application: "YouthApplication") -> int:
        """
        Calculate the age of the applicant. Note that this is not the exact age,
        as only the year of birth and the year of application are used.
        """
        birthdate = application.birthdate
        if not birthdate:
            return 0
        current_year = application.created_at.year
        return current_year - birthdate.year


def get_target_group_choices() -> List[Tuple[str, str]]:
    """
    Returns a list of tuples for ChoiceField options containing subclass identifiers.
    e.g. [('primary_target_group', '9th grader'), ...]
    """
    return [
        (cls().identifier, cls().name) for cls in AbstractTargetGroup.__subclasses__()
    ]


class NinthGraderTargetGroup(AbstractTargetGroup):
    name = _("9. luokkalainen")
    identifier = "primary_target_group"

    def is_valid(self, application: "YouthApplication") -> bool:
        """
        9th graders: 16 years old, MUST live in Helsinki.
        """
        # Age check: 16 years old
        if self.get_age_by_year(application) != 16:
            return False

        # Municipality check: Must live in Helsinki
        return application.is_helsinkian


class UpperSecondaryFirstYearTargetGroup(AbstractTargetGroup):
    name = _("Toisen asteen ensimmäisen vuoden opiskelija")
    identifier = "secondary_target_group"

    def is_valid(self, application: "YouthApplication") -> bool:
        """
        Upper secondary 1st year: 17 years old, MUST live in Helsinki.

        (NOTE: Earlier, also the school attendance in helsinkian school has been enough.
        School attendance in Helsinki for non-residents requires manual check,
        so is_valid returns False here).
        """
        # Age check: 17 years old
        if self.get_age_by_year(application) != 17:
            return False

        # Municipality check: Must live in Helsinki
        return application.is_helsinkian


def get_target_group_class(identifier: str) -> type[AbstractTargetGroup] | None:
    """
    Returns the target group class associated with the given identifier.
    """
    for cls in AbstractTargetGroup.__subclasses__():
        if cls().identifier == identifier:
            return cls
    return None
