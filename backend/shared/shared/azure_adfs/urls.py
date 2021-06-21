from django.urls import include, path, re_path
from shared.azure_adfs.views import HelsinkiOAuth2CallbackView

urlpatterns = [
    re_path(r"^callback$", HelsinkiOAuth2CallbackView.as_view(), name="callback"),
    path("", include("django_auth_adfs.urls")),
]
