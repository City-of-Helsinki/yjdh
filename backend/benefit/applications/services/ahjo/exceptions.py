from applications.models import AhjoStatus


class DecisionProposalError(Exception):
    """Custom exception for errors in the sending of decision proposals."""



class DecisionProposalAlreadyAcceptedError(DecisionProposalError):
    """
    Raised when a decision proposal already has been accepted in Ahjo,
    but for some reason a decision proposal for the application is still being sent.

    Attributes:
        ahjo_status (AhjosStatus): The decision_proposal_accepted status.
    """

    def __init__(self, message: str, ahjo_status: AhjoStatus) -> None:
        self.message = message
        self.ahjo_status = ahjo_status
        super().__init__(self.message)


class AhjoApiClientException(Exception):
    """
    Raised when an error occurs in the AhjoApiClient.
    """



class MissingAhjoCaseIdError(AhjoApiClientException):
    """
    Raised when a Ahjo request that requires a case id is missing the case id.
    """



class MissingHandlerIdError(AhjoApiClientException):
    """
    Raised when a Ahjo request that requires a handler id is missing the handler id.
    """



class MissingOrganizationIdentifier(Exception):
    """
    Raised when an organization identifier is missing from AhjoSettings in the database.
    """



class AhjoTokenExpiredException(Exception):
    """
    Raised when the Ahjo token has expired. The token should be re-configured manually, see instructions at:
    https://helsinkisolutionoffice.atlassian.net/wiki/spaces/KAN/pages/8687517756/Siirto+yll+pitoon#Ahjo-autentikaatio-tokenin-haku-ja-asettaminen-manuaalisesti.
    """



class AhjoTokenRetrievalException(Exception):
    """
    Raised when the Ahjo token has expired or it could not be otherwise refreshed automatically.
    The token should be re-configured manually, see instructions at:
    https://helsinkisolutionoffice.atlassian.net/wiki/spaces/KAN/pages/8687517756/Siirto+yll+pitoon#Ahjo-autentikaatio-tokenin-haku-ja-asettaminen-manuaalisesti.
    """



class InvalidAhjoTokenException(Exception):
    """
    Raised when the Ahjo token is missing data or is otherwise invalid.
    """



class AhjoCallbackError(Exception):
    """
    Raised when an error occurs in the Ahjo callback.
    """



class AhjoDecisionError(Exception):
    """
    Raised when an error occurs in substituting application data into the decision text.
    """



class AhjoDecisionDetailsParsingError(Exception):
    """
    Raised when an error occurs in parsing the decision details after a details query to Ahjo.
    """

