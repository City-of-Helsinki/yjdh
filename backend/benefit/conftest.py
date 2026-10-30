import pytest
from django.test import override_settings


@pytest.fixture(scope="session", autouse=True)
def test_media_root(tmp_path_factory):
    media_root = tmp_path_factory.mktemp("media")
    with override_settings(MEDIA_ROOT=str(media_root)):
        yield
