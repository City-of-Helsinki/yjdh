from django.urls import include, path, re_path

from shared.azure_adfs.views import HelsinkiOAuth2CallbackView, HelsinkiOAuth2LoginView

urlpatterns = [
    re_path(r"^callback$", HelsinkiOAuth2CallbackView.as_view(), name="callback"),
    re_path(r"^login$", HelsinkiOAuth2LoginView.as_view(), name="login"),
    path("", include("django_auth_adfs.urls")),
]
