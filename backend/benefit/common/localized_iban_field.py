from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _
from localflavor.generic.models import IBANField
from localflavor.generic.validators import IBANValidator


class LocalizedIBANValidator(IBANValidator):
    def __init__(self, use_nordea_extensions=False, include_countries=None):
        super(LocalizedIBANValidator, self).__init__(
            use_nordea_extensions, include_countries
        )

    def __call__(self, value):
        try:
            super(LocalizedIBANValidator, self).__call__(value)
        except ValidationError as e:
            raise ValidationError(_("Invalid IBAN")) from e


class LocalizedIBANField(IBANField):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # switch the validator.
        # self.validators is a read-only property so it can't be assigned to. The property value is a list that
        # is mutable so we can replace the contents of the list with the slice assignment.
        # Also, avoid list modification while iterating over it.
        self.validators[:] = [
            v for v in self.validators if not isinstance(v, IBANValidator)
        ]
        self.validators.append(
            LocalizedIBANValidator(self.use_nordea_extensions, self.include_countries)
        )
