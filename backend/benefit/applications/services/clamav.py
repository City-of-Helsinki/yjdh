import logging

import requests
from django.conf import settings
from rest_framework.exceptions import APIException

log = logging.getLogger(__name__)


class ClamavClient:
    BASE_URL = None

    def __init__(self):
        if not settings.CLAMAV_URL and not settings.NEXT_PUBLIC_MOCK_FLAG:
            log.warning(
                "CLAMAV_URL not defined in settings -- Clamav Client not enabled"
            )
            return

        self.set_base_url(settings.CLAMAV_URL)

    def set_base_url(self, base_url):
        if base_url:
            self.BASE_URL = base_url + ("" if base_url.endswith("/") else "/")

    def scan(self, name, _bytes):
        if not self.BASE_URL:
            return

        response = requests.post(
            self.BASE_URL + "scan", files={"attachment_file": (name, _bytes)}
        )

        if (
            not response
            or response.status_code != 200
            or not response.json()["success"]
        ):
            raise FileScanError(name)

        for entry in response.json()["data"]["result"]:
            if bool(entry["is_infected"]):
                raise FileInfectedError(entry["name"], entry["viruses"])

    def version(self):
        if not self.BASE_URL:
            return

        response = requests.get(self.BASE_URL + "version")
        return response.json()

    def ping(self):
        if not self.BASE_URL:
            return

        response = requests.get(self.BASE_URL + "ping")
        return response.json()


class FileScanError(Exception):
    def __init__(self, file_name):
        self.file_name = file_name


class FileInfectedError(Exception):
    def __init__(self, file_name, viruses):
        self.file_name = file_name
        self.viruses = viruses


class ClamAvServiceUnavailableException(APIException):
    status_code = 503
    default_detail = "Service temporarily unavailable, try again later."
    default_code = "service_unavailable"


clamav_client = ClamavClient()
