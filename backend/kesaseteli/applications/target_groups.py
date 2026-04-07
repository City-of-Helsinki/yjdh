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

Yearly configuration rows are built from these catalog entries when creating
`SummerVoucherConfiguration`. The subclass definitions are the source of truth
and year configuration rows then define which groups are active for a given year.

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

from common.utils import get_age

if TYPE_CHECKING:
    from applications.models import YouthApplication


class AbstractTargetGroup(ABC):
    """
    Base contract for youth target groups used in eligibility rules.

    Concrete subclasses define one target-group entry point by providing:

    - a stable ``identifier`` persisted in the database
    - localized ``name`` and ``description`` values for UI presentation
    - age eligibility rules through :meth:`is_age_valid`

    All subclasses are discovered from
    :func:`AbstractTargetGroup.__subclasses__` so configuration and UI layers can
    present all supported target groups dynamically.

    :ivar identifier: Stable target-group key used by persisted values.
    :ivar name: Localized target-group label.
    :ivar description: Localized target-group details for forms and tooling.
    """

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

    @property
    @abstractmethod
    def description(self) -> str:
        """
        Description of the target group. Used to explain the target group to
        the user in the admin panel.
        """

    def get_age_by_year(self, application: "YouthApplication") -> int:
        """
        Calculate the age of the applicant. Note that this is not the exact age,
        as only the year of birth and the year of application are used.

        :param application: The youth application used to read `birthdate` and
            `created_at`.
        :return: Age estimate based on year-level precision. Returns ``0`` if the
            application has no birthdate.

        Example:
            >>> get_target_group_class_by_age(16).__name__
            'NinthGraderTargetGroup'
        """
        birthdate = application.birthdate
        if not birthdate:
            return 0
        return get_age(birthdate, application.created_at.year)

    def is_age_valid(self, age: int) -> bool:
        """
        Check if the given age is valid for this target group.
        Subclasses can override this to support ranges or other rules.

        :param age: Applicant age used by the active target-group rule.
        :return: ``True`` when the age is valid for this group, ``False``
            otherwise. The base implementation returns ``False`` to make overrides
            explicit in concrete target groups.
        """
        return False

    def is_valid(self, application: "YouthApplication") -> bool:
        """
        Check if the given application belongs to this target group.
        """
        return (
            self.is_age_valid(self.get_age_by_year(application))
            and application.is_helsinkian
        )


def get_target_group_class_by_age(age: int) -> type[AbstractTargetGroup] | None:
    """
    Returns the target group class that matches the given age.

    :param age: Applicant age to resolve into a target group.
    :return: A target group class if one subclass accepts the age, otherwise
        ``None``.

    Example:
        >>> get_target_group_class_by_age(16).__name__
        'NinthGraderTargetGroup'
        >>> get_target_group_class_by_age(99)
        None
    """
    for subclass in AbstractTargetGroup.__subclasses__():
        if subclass().is_age_valid(age):
            return subclass
    return None


def get_target_group_choices() -> List[Tuple[str, str]]:
    """
    Returns a list of tuples for ChoiceField options containing subclass identifiers.
    e.g. [('primary_target_group', '9th grader'), ...]

    Returns all the currently available target groups based on the subclasses.

    :return: List of ``(identifier, localized name)`` pairs for all registered
        ``AbstractTargetGroup`` subclasses.

    Example:
        >>> get_target_group_choices()[:2]
        [('hki_15', '8. luokkalainen'), ('primary_target_group', '9. luokkalainen')]

    """
    return [
        (cls().identifier, cls().name) for cls in AbstractTargetGroup.__subclasses__()
    ]


class EighthGraderTargetGroup(AbstractTargetGroup):
    name = _("8. luokkalainen")
    identifier = "hki_15"
    description = _("8th graders: 15 years old, MUST live in Helsinki.")

    def is_age_valid(self, age: int) -> bool:
        return age == 15


class NinthGraderTargetGroup(AbstractTargetGroup):
    name = _("9. luokkalainen")
    identifier = "primary_target_group"
    description = _("9th graders: 16 years old, MUST live in Helsinki.")

    def is_age_valid(self, age: int) -> bool:
        return age == 16


class UpperSecondaryFirstYearTargetGroup(AbstractTargetGroup):
    name = _("Toisen asteen ensimmäisen vuoden opiskelija")
    identifier = "secondary_target_group"
    description = _("Upper secondary 1st year: 17 years old, MUST live in Helsinki.")

    def is_age_valid(self, age: int) -> bool:
        return age == 17


class UpperSecondarySecondYearTargetGroup(AbstractTargetGroup):
    name = _("Toisen asteen toisen vuoden opiskelija")
    identifier = "hki_18"
    description = _("Upper secondary 2nd year: 18 years old, MUST live in Helsinki.")

    def is_age_valid(self, age: int) -> bool:
        return age == 18


def get_target_group_class(identifier: str) -> type[AbstractTargetGroup] | None:
    """
    Returns the target group class associated with the given identifier.

    :param identifier: Target-group identifier string to resolve.
    :return: The matching target group class, or ``None`` if the identifier is
        not registered.

    Example:
        >>> get_target_group_class("primary_target_group")
        <class 'applications.target_groups.NinthGraderTargetGroup'>
        >>> get_target_group_class("unknown_identifier") is None
        True

    Unknown identifiers return ``None`` rather than raising.
    """
    for cls in AbstractTargetGroup.__subclasses__():
        if cls().identifier == identifier:
            return cls
    return None


def get_target_group_data(identifiers: List[str]) -> List[dict]:
    """
    Returns a list of structured data (id, name, description) for the
    given list of target group identifiers.

    :param identifiers: A list of target-group identifier strings.
    :return: A list of dictionaries with keys ``id``, ``name``, and
        ``description``.

    Example:
        >>> get_target_group_data(["primary_target_group", "unknown"])
        [
            {
                "id": "primary_target_group",
                "name": "9. luokkalainen",
                "description": "9th graders: 16 years old, MUST live in Helsinki.",
            }
        ]
        >>> get_target_group_data(["unknown"])
        []

    Identifiers that are not registered in :class:`AbstractTargetGroup` subclasses
    are ignored and do not appear in the output.
    """
    target_groups = []
    for identifier in identifiers:
        target_group_cls = get_target_group_class(identifier)
        if target_group_cls:
            target_group = target_group_cls()
            target_groups.append(
                {
                    "id": target_group.identifier,
                    "name": str(target_group.name),
                    "description": str(target_group.description),
                }
            )
    return target_groups



