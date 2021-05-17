from django.urls import include, path

from oidc.views import HelsinkiOIDCLogoutView, HelsinkiOIDCUserInfoView

urlpatterns = [
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
