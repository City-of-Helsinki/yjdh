from django.core.exceptions import ValidationError
from django.template import Template, TemplateSyntaxError
from django.utils.translation import gettext_lazy as _


def validate_template_syntax(value):
    """
    Validate that the given string is a valid Django template.
    """
    try:
        Template(value)
    except TemplateSyntaxError as e:
        raise ValidationError(
            _("Invalid template syntax: %(error)s"),
            params={"error": str(e)},
        )
