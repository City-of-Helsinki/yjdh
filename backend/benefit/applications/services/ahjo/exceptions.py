from applications.models import AhjoStatus


class DecisionProposalError(Exception):
    """Custom exception for errors in the sending of decision proposals."""

    pass


class DecisionProposalAlreadyAcceptedError(DecisionProposalError):
    """
    Raised when a decision proposal already has been accepted in Ahjo,
    but for some reason a decision proposal for the application is still being sent.

    Attributes:
        ahjo_status (AhjosStatusEnum): The decision_proposal_accepted status.
    """

    def __init__(self, message: str, ahjo_status: AhjoStatus) -> None:
        self.message = message
        self.ahjo_status = ahjo_status
        super().__init__(self.message)
