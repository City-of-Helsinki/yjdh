from django.conf import settings
from django.urls import include, path

from oidc.mock_views import (
    MockAuthenticationRequestView,
    MockLogoutView,
    MockUserInfoView,
)
from oidc.views import HelsinkiOIDCLogoutView, HelsinkiOIDCUserInfoView

urlpatterns = []

if settings.MOCK_FLAG:
    urlpatterns += [
        path(
            "authenticate/",
            MockAuthenticationRequestView.as_view(),
            name="oidc_authentication_init",
        ),
        path(
            "logout/",
            MockLogoutView.as_view(),
            name="oidc_logout",
        ),
        path(
            "userinfo/",
            MockUserInfoView.as_view(),
            name="oidc_userinfo",
        ),
    ]
else:
    urlpatterns += [
        path(
            "logout/",
            HelsinkiOIDCLogoutView.as_view(),
            name="oidc_logout",
        ),
        path(
            "userinfo/",
            HelsinkiOIDCUserInfoView.as_view(),
            name="oidc_userinfo",
        ),
        path("", include("mozilla_django_oidc.urls")),
    ]
