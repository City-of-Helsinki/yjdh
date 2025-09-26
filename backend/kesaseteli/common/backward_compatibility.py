from typing import List, Optional, Tuple

DEFAULT_TARGET_SCHEMES: Tuple[str] = ("https://",)


def convert_to_django_4_2_csrf_trusted_origin(
    origin: Optional[str],
    target_schemes: Tuple[str] = DEFAULT_TARGET_SCHEMES,
) -> List[str]:
    """
    Convert the input CSRF trusted origin from Django 3.2 -> 4.2 format using
    the given target schemes, if not already in Django 4.2 format. If the
    origin is already in Django 4.2 format, return it as it is. Also if the
    origin is empty, then return an empty list.

    Django 3.2 and 4.2 CSRF_TRUSTED_ORIGINS documentations:
      - https://docs.djangoproject.com/en/3.2/ref/settings/#csrf-trusted-origins
      - https://docs.djangoproject.com/en/4.2/ref/settings/#csrf-trusted-origins

    :param origin: Origin to convert
    :param target_schemes: Schemes to add to origin, only "https://" by default
    """
    if not origin:
        return []
    elif "://" in origin:
        # Origin uses scheme, so it should already be Django 4.2 compatible
        return [origin]
    else:
        optional_wildcard_prefix = "*" if origin.startswith(".") else ""
        return [
            f"{scheme}{optional_wildcard_prefix}{origin}" for scheme in target_schemes
        ]


def convert_to_django_4_2_csrf_trusted_origins(
    origins: List[str],
    target_schemes: Tuple[str] = DEFAULT_TARGET_SCHEMES,
):
    """
    Convert the input CSRF_TRUSTED_ORIGINS setting from Django 3.2 -> 4.2
    format using the given target schemes, if not already in Django 4.2 format.
    If any of the origins are already in Django 4.2 format, return them as they
    are.

    Django 3.2 and 4.2 CSRF_TRUSTED_ORIGINS documentations:
      - https://docs.djangoproject.com/en/3.2/ref/settings/#csrf-trusted-origins
      - https://docs.djangoproject.com/en/4.2/ref/settings/#csrf-trusted-origins

    :param origins: Origins to convert
    :param target_schemes: Schemes to add to origins, only "https://" by default
    """
    result = []
    for origin in origins:
        result.extend(convert_to_django_4_2_csrf_trusted_origin(origin, target_schemes))
    return result
