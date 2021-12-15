from django.conf import settings
from django.urls import include, path

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

urlpatterns = []

if settings.MOCK_FLAG:
    from shared.oidc.views.mock_views import (
        MockAuthenticationRequestView,
        MockLogoutCallbackView,
        MockLogoutView,
        MockUserInfoView,
    )

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
            "logout_callback/",
            MockLogoutCallbackView.as_view(),
            name="oidc_logout_callback",
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
            "authenticate/",
            HelsinkiOIDCAuthenticationRequestView.as_view(),
            name="oidc_authentication_init",
        ),
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
            "logout_callback/",
            HelsinkiOIDCLogoutCallbackView.as_view(),
            name="oidc_logout_callback",
        ),
        path(
            "userinfo/",
            HelsinkiOIDCUserInfoView.as_view(),
            name="oidc_userinfo",
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
