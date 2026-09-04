from django.core.exceptions import ImproperlyConfigured

from kesaseteli.constants import MIN_API_KEY_LENGTH


def validate_api_key(key_name: str, key_value: str):
    if key_value and len(key_value) < MIN_API_KEY_LENGTH:
        raise ImproperlyConfigured(
            f"{key_name} must be at least {MIN_API_KEY_LENGTH} characters long."
        )
