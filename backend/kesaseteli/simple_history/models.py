class HistoricalChanges:
    """
    Stub replacing HistoricalChanges class from django-simple-history package
    i.e. https://pypi.org/project/django-simple-history/

    This stub exists solely to satisfy the import in legacy migrations
    0001 and 0012, which reference this class in their bases= tuples.
    The Historical* models were all removed by migration 0050 during year 2026.

    Uses in legacy migrations:
    ```
        import simple_history.models
        bases=(simple_history.models.HistoricalChanges, models.Model),
    ```
    """


class HistoricalRecords:
    """
    Temporary stub replacing HistoricalRecords class from django-simple-history package.
    """

    def __init__(self, *args, **kwargs):
        pass
