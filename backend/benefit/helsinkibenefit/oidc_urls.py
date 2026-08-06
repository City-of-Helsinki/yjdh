from django.urls import include, path

from shared.oidc.urls import base_oidc_urlpatterns

urlpatterns = base_oidc_urlpatterns + [
    # Eauth from suomifi-on-behalf (replaces shared.oidc's eAuthorizations flow)
    path("", include("suomifi_on_behalf.urls")),
]
