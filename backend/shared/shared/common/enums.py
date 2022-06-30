import re

from django.db import models
from django.utils.translation import gettext_lazy as _


class LoginProvider(models.TextChoices):
    HELSINKI_PROFILE = "Helsinki-profiili", _("Helsinki-profiili")
    SUOMI_FI = "Suomi.fi", _("Suomi.fi")

    @staticmethod
    def suomi_fi_matcher() -> re.Pattern:
        """
        Regular expression pattern matching LoginProvider.SUOMI_FI enum value
        with leeway related to whitespace, character case and word delimiters.
        """
        return re.compile(r"^\s*Suomi[._]?fi\s*$", re.IGNORECASE)

    @staticmethod
    def helsinki_profile_matcher() -> re.Pattern:
        """
        Regular expression pattern matching LoginProvider.HELSINKI_PROFILE enum value
        with leeway related to whitespace, character case, word delimiters and language.
        """
        return re.compile(r"^\s*Helsinki[ _-]?(profile|profiili)\s*$", re.IGNORECASE)

    @classmethod
    def is_suomi_fi(cls, value) -> bool:
        """
        Does the given value as a string match LoginProvider.SUOMI_FI with
        LoginProvider.suomi_fi_matcher()?
        """
        return cls.suomi_fi_matcher().fullmatch(str(value)) is not None

    @classmethod
    def is_helsinki_profile(cls, value) -> bool:
        """
        Does the given value as a string match LoginProvider.HELSINKI_PROFILE with
        LoginProvider.helsinki_profile_matcher()?
        """
        return cls.helsinki_profile_matcher().fullmatch(str(value)) is not None
