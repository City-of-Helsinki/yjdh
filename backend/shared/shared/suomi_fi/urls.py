from django.conf import settings
from django.urls import path

from shared.suomi_fi.mock_views import MockSuomiFiSAML2AuthenticationRequestView
from shared.suomi_fi.views import SuomiFiSAML2AuthenticationRequestView

urlpatterns = []

if settings.NEXT_PUBLIC_MOCK_FLAG:
    urlpatterns += [
        path(
            "authenticate/",
            MockSuomiFiSAML2AuthenticationRequestView.as_view(),
            name="saml2_authentication_init",
        ),
    ]
else:
    urlpatterns += [
        path(
            "authenticate/",
            SuomiFiSAML2AuthenticationRequestView.as_view(),
            name="saml2_authentication_init",
        ),
    ]
