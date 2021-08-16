from django.conf import settings
from django.urls import include, path

from shared.oidc.views.eauth_views import (
    EauthAuthenticationCallbackView,
    EauthAuthenticationRequestView,
)
from shared.oidc.views.hki_views import (
    HelsinkiOIDCAuthenticationCallbackView,
    HelsinkiOIDCBackchannelLogoutView,
    HelsinkiOIDCLogoutView,
    HelsinkiOIDCUserInfoView,
)

urlpatterns = []

if settings.MOCK_FLAG:
    from shared.oidc.views.mock_views import (
        MockAuthenticationRequestView,
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
