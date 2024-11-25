from enum import Enum, unique


@unique
class AhjoSettingName(Enum):
    """
    Enum representing different Ahjo setting names.

    The @unique decorator ensures that no two enum members have the same value.
    Using auto() generates unique, incrementing values, but we'll use string values
    to maintain readability and compatibility with existing database entries.
    """

    DECISION_MAKER = "ahjo_decision_maker"

    def __str__(self):
        """
        Allow the enum to be used directly as a string when converted.
        This makes it easy to use in database queries or comparisons.
        """
        return self.value

    def __repr__(self):
        """
        Provide a clear representation of the enum member.
        """
        return f"{self.__class__.__name__}.{self.name}"
