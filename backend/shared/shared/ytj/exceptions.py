class YTJNotFoundError(ValueError):
    """
    Exception raised when no company is found in YTJ.
    """


class YTJParseError(ValueError):
    """
    Exception raised when YTJ data cannot be parsed (missing required fields).
    """
