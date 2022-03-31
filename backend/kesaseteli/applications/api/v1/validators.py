from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

from applications.enums import AdditionalInfoUserReason


def validate_additional_info_user_reasons(
    input_reasons_list, allow_empty_list=True
) -> None:
    """
    Validate input_reasons_list as a list of unique values from AdditionalInfoUserReason.
    The list may be empty only if allow_empty_list is True.

    :raises ValidationError: If input_reasons_list is not a list of unique values from
                             AdditionalInfoUserReason, or if allow_empty_list is False
                             and input_reasons_list is an empty list.
    """
    if not isinstance(input_reasons_list, list):
        raise ValidationError(
            _("additional_info_user_reasons must be a list, was %(type)s")
            % {"type": type(input_reasons_list)}
        )

    if input_reasons_list == [] and not allow_empty_list:
        raise ValidationError(
            "additional_info_user_reasons must be non-empty, was empty"
        )

    valid_reasons_set = set(AdditionalInfoUserReason.values)

    try:
        input_reasons_set = set(input_reasons_list)
    except TypeError:
        raise ValidationError(
            _("Invalid type input values for additional_info_user_reasons")
        )

    if not input_reasons_set.issubset(valid_reasons_set):
        raise ValidationError(
            _(
                "additional_info_user_reasons must contain only values from "
                "AdditionalInfoUserReason, contained invalid values %(invalid_values)s"
            )
            % {"invalid_values": sorted(input_reasons_set - valid_reasons_set)}
        )

    if len(input_reasons_list) != len(input_reasons_set):
        raise ValidationError(
            "additional_info_user_reasons must contain unique values, contained duplicates"
        )
