from datetime import date

from django.core.exceptions import ValidationError
from django.utils import translation
from django.utils.translation import gettext_lazy as _
from rest_framework.permissions import BasePermission
from stdnum.fi.hetu import is_valid as is_valid_finnish_social_security_number


class DenyAll(BasePermission):
    """
    Deny all access (the opposite of AllowAny).
    """

    def has_permission(self, request, view):
        return False


def validate_finnish_social_security_number(value):
    """
    Raise a ValidationError if the given value is not a Finnish social security number.
    """
    if not is_valid_finnish_social_security_number(value):
        raise ValidationError(
            _("%(value)s is not a valid Finnish social security number"),
            params={"value": value},
        )


def validate_optional_finnish_social_security_number(value):
    """
    Raise a ValidationError if the given value is not None, an empty string or a Finnish
    social security number.
    """
    if value is not None and value != "":
        validate_finnish_social_security_number(value)


def getattr_nested(obj, attrs: list):
    """
    Example:
        obj: Application
        attrs: ["company", "business_id"]
        returns obj.company.business_id if company exists, else returns ""
    """
    attr = attrs.pop(0)
    value = getattr(obj, attr, "")
    if not value:
        return ""

    if attrs:
        return getattr_nested(value, attrs)
    else:
        if isinstance(value, date):
            value = value.strftime("%d.%m.%Y")
        elif hasattr(obj, f"get_{attr}_display"):
            with translation.override("fi"):
                value = getattr(obj, f"get_{attr}_display")()
        return value
