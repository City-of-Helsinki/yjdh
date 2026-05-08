from urllib.parse import urlparse, urlunparse

from storages.backends.azure_storage import AzureStorage


class AzureStorageWithoutQuerystringAuth(AzureStorage):
    """
    Extends AzureStorage to strip the SAS token from URLs, matching the
    behaviour of the S3 and GCS backends in django-storages with querystring_auth=False.
    """

    def url(self, name, expire=None, parameters=None, mode="r"):
        sas_url = super().url(name, expire=expire, parameters=parameters, mode=mode)
        parsed_url = urlparse(sas_url)
        return urlunparse(parsed_url._replace(query=""))
