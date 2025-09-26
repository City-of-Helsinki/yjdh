from rest_framework.renderers import BrowsableAPIRenderer
from rest_framework.settings import api_settings


def test_django_rest_framework_browsable_api_disabled():
    """
    Test that Django Rest Framework's Browsable API is disabled.

    This is done to make sure that no information is leaked through the
    Browsable API interface as it can populate dropdown menus with information
    from the backend if it is enabled.
    """
    for renderer_class in api_settings.DEFAULT_RENDERER_CLASSES:
        assert not issubclass(renderer_class, BrowsableAPIRenderer)
