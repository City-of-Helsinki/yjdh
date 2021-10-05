from django.conf import settings
from django.urls import reverse


def get_public_reverse_url(request, reverse_name: str) -> str:
    """
    Builds a public url based on the setting. This is required in some environments that are
    using separate internal and public URLs.
    """
    path = reverse(reverse_name)

    if settings.PUBLIC_URL:
        return f"{settings.PUBLIC_URL}{path}"

    return request.build_absolute_uri(path)
