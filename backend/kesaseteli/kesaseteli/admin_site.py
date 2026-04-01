from urllib.parse import urlencode

from django.conf import settings
from django.contrib import admin
from django.contrib.admin.apps import AdminConfig
from django.contrib.auth import REDIRECT_FIELD_NAME
from django.core.exceptions import PermissionDenied
from django.http import HttpResponseRedirect
from django.urls import reverse


class KesaseteliAdminSite(admin.AdminSite):
    login_template = "admin/hel_login.html"

    def each_context(self, request):
        context = super().each_context(request)
        context["password_login_disabled"] = getattr(
            settings, "PASSWORD_LOGIN_DISABLED", False
        )
        return context

    def login(self, request, extra_context=None):
        if request.method == "POST" and getattr(
            settings, "PASSWORD_LOGIN_DISABLED", False
        ):
            # If password login is disabled, we block the POST request to the login
            # view. This ensures that credentials cannot be submitted.
            raise PermissionDenied("Password login is disabled.")
        return super().login(request, extra_context)

    def logout(self, request, extra_context=None):
        """
        Custom logout handler that redirects to the correct IDP logout flow
        based on the user's authentication backend, and ensures they return
        to the admin login page.
        """
        backend = request.session.get("_auth_user_backend")

        if backend == "shared.azure_adfs.auth.HelsinkiAdfsAuthCodeBackend":
            logout_url = reverse("django_auth_adfs:logout")
        elif backend == "shared.suomi_fi.auth.SuomiFiSAML2AuthenticationBackend":
            logout_url = reverse("saml2_logout")
        else:
            return super().logout(request, extra_context)

        # root of admin site (e.g. /admin/)
        next_url = request.build_absolute_uri(reverse(f"{self.name}:index"))
        query = urlencode({REDIRECT_FIELD_NAME: next_url})

        return HttpResponseRedirect(f"{logout_url}?{query}")


class KesaseteliAdminConfig(AdminConfig):
    default_site = "kesaseteli.admin_site.KesaseteliAdminSite"

    def ready(self):
        super().ready()
        from . import admin  # noqa
