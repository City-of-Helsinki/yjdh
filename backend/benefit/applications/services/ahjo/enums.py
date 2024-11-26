from enum import Enum, unique


@unique
class AhjoSettingName(Enum):
    """
    Enum representing different Ahjo setting names.

    The @unique decorator ensures that no two enum members have the same value.
    """

    DECISION_MAKER = "ahjo_decision_maker"
    DECISION_MAKER_ORG_ID = "ahjo_org_identifier"
    SIGNER = "ahjo_signer"
    SIGNER_ORG_IDS = "ahjo_signer_org_ids"

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
