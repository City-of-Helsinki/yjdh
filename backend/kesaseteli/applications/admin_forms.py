from django import forms
from django.utils.translation import gettext_lazy as _


class SchoolImportForm(forms.Form):
    school_names = forms.CharField(
        widget=forms.Textarea(
            attrs={
                "placeholder": _("School A\nSchool B\nSchool C"),
                "rows": 10,
                "cols": 60,
            }
        ),
        required=True,
        label=_("School names (one per line)"),
        help_text=_(
            "Enter school names, one per line. Existing schools will be skipped."
        ),
    )
