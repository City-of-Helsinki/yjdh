from urllib.parse import urljoin

from django.conf import settings


def handler_403_url():
    return urljoin(settings.HANDLER_URL, "/fi/403")


def handler_youth_application_processing_url(youth_application_pk):
    return urljoin(settings.HANDLER_URL, f"/?id={youth_application_pk}")
