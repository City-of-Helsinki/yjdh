from django.urls import include, path

from shared.common.views import MockEnabledProxyView
from shared.oidc.views.eauth_views import (
    EauthAuthenticationCallbackView,
    EauthAuthenticationRequestView,
)
from shared.oidc.views.hki_views import (
    HelsinkiOIDCAuthenticationCallbackView,
    HelsinkiOIDCAuthenticationRequestView,
    HelsinkiOIDCBackchannelLogoutView,
    HelsinkiOIDCLogoutCallbackView,
    HelsinkiOIDCLogoutView,
    HelsinkiOIDCUserInfoView,
)
from shared.oidc.views.mock_views import (
    MockAuthenticationRequestView,
    MockLogoutCallbackView,
    MockLogoutView,
    MockUserInfoView,
)

urlpatterns = [
    path(
        "authenticate/",
        MockEnabledProxyView(
            real_view_class=HelsinkiOIDCAuthenticationRequestView,
            mock_view_class=MockAuthenticationRequestView,
        ),
        name="oidc_authentication_init",
    ),
    path(
        "logout/",
        MockEnabledProxyView(
            real_view_class=HelsinkiOIDCLogoutView,
            mock_view_class=MockLogoutView,
        ),
        name="oidc_logout",
    ),
    path(
        "logout_callback/",
        MockEnabledProxyView(
            real_view_class=HelsinkiOIDCLogoutCallbackView,
            mock_view_class=MockLogoutCallbackView,
        ),
        name="oidc_logout_callback",
    ),
    path(
        "userinfo/",
        MockEnabledProxyView(
            real_view_class=HelsinkiOIDCUserInfoView,
            mock_view_class=MockUserInfoView,
        ),
        name="oidc_userinfo",
    ),
    path(
        "callback/",
        HelsinkiOIDCAuthenticationCallbackView.as_view(),
        name="oidc_authentication_callback",
    ),
    path(
        "backchannel/logout/",
        HelsinkiOIDCBackchannelLogoutView.as_view(),
        name="oidc_backchannel_logout",
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
