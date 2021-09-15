from datetime import date

from django.utils import translation


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
