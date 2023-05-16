from django.urls import include, path, re_path
from django_auth_adfs.views import OAuth2LoginView, OAuth2LogoutView

from shared.azure_adfs.views import HelsinkiOAuth2CallbackView
from shared.common.views import MockEnabledProxyView

from .mock_views import (
    MockOAuth2CallbackView,
    MockOAuth2LoginView,
    MockOAuth2LogoutView,
)

app_name = "django_auth_adfs"

urlpatterns = [
    re_path(
        r"^callback$",
        MockEnabledProxyView(
            real_view_class=HelsinkiOAuth2CallbackView,
            mock_view_class=MockOAuth2CallbackView,
        ),
        name="callback",
    ),
    re_path(
        r"^login$",
        MockEnabledProxyView(
            real_view_class=OAuth2LoginView, mock_view_class=MockOAuth2LoginView
        ),
        name="login",
    ),
    re_path(
        r"^logout$",
        MockEnabledProxyView(
            real_view_class=OAuth2LogoutView, mock_view_class=MockOAuth2LogoutView
        ),
        name="logout",
    ),
    path("", include("django_auth_adfs.urls")),
]
