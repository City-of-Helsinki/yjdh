from django.db import models


class TetPostingTemp(models.Model):
    """
    Used in local dev enviroment & review when NEXT_PUBLIC_MOCK_FLAG is set.

    NOT TO BE USED IN PRODUCTION!
    """

    owner = models.CharField(max_length=100)
    data = models.JSONField(verbose_name="posting data")
