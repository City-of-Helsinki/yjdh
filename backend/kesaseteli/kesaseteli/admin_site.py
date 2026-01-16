from django.conf import settings
from django.contrib import admin
from django.contrib.admin.apps import AdminConfig
from django.core.exceptions import PermissionDenied


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


class KesaseteliAdminConfig(AdminConfig):
    default_site = "kesaseteli.admin_site.KesaseteliAdminSite"
