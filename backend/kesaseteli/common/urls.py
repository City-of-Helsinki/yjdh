from urllib.parse import urljoin

from django.conf import settings


def handler_403_url():
    return urljoin(settings.HANDLER_URL, "/fi/403")
