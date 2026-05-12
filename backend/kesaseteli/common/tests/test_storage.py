from unittest.mock import patch

import pytest
from storages.backends.azure_storage import AzureStorage

from common.storage import AzureStorageWithoutQuerystringAuth

SAS_URL = (
    "https://myaccount.blob.core.windows.net/mycontainer/myfile.jpg"
    "?sv=2021-06-08&se=2026-01-01T00%3A00%3A00Z&sr=b&sp=r&sig=FAKESIG"
)
CLEAN_URL = "https://myaccount.blob.core.windows.net/mycontainer/myfile.jpg"


def _make_storage(model=AzureStorageWithoutQuerystringAuth, **overrides):
    kwargs = dict(
        account_name="myaccount",
        sas_token="FAKESAS",
        azure_container="mycontainer",
        expiration_secs=3600,
    )
    kwargs.update(overrides)
    return model(**kwargs)


@pytest.mark.parametrize(
    "model, expected_url",
    [
        (AzureStorage, SAS_URL),
        (AzureStorageWithoutQuerystringAuth, CLEAN_URL),
    ],
)
@patch.object(AzureStorage, "url", return_value=SAS_URL)
def test_url_querystring_auth(mock_url, model, expected_url):
    storage = _make_storage(model=model)
    result = storage.url("myfile.jpg")

    assert result == expected_url


@patch.object(AzureStorage, "url", return_value=SAS_URL)
def test_url_querystring_auth_false_no_query_string_in_parent_url(mock_url):
    storage = _make_storage()
    result = storage.url("myfile.jpg")

    assert result == CLEAN_URL
    assert "?" not in result
