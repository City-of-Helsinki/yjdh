from django.conf import settings
from django.urls import include, path

from oidc.views.eauth_views import (
    EauthAuthenticationCallbackView,
    EauthAuthenticationRequestView,
)
from oidc.views.hki_views import (
    HelsinkiOIDCAuthenticationCallbackView,
    HelsinkiOIDCLogoutView,
    HelsinkiOIDCUserInfoView,
)
from oidc.views.mock_views import (
    MockAuthenticationRequestView,
    MockLogoutView,
    MockUserInfoView,
)

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
            "callback/",
            HelsinkiOIDCAuthenticationCallbackView.as_view(),
            name="oidc_authentication_callback",
        ),
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
        path(
            "eauthorizations/authenticate/",
            EauthAuthenticationRequestView.as_view(),
            name="eauth_authentication_init",
        ),
        path(
            "eauthorizations/callback/",
            EauthAuthenticationCallbackView.as_view(),
            name="eauth_authentication_callback",
        ),
    ]
