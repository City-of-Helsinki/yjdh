class BatchCompletionDecisionDateError(Exception):
    """
    Used when decision date is not in validation's range
    """



class BatchCompletionRequiredFieldsError(Exception):
    """
    Raised when there is necessary information missing
    when trying to complete a batch
    """



class BatchTooManyDraftsError(Exception):
    """
    Raised when there is too many drafts with the same value
    of proposal_for_decision
    """

