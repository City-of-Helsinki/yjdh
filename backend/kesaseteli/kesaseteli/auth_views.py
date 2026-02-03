import logging
from django.conf import settings
from django.shortcuts import redirect
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.generic import View
from django_auth_adfs.views import OAuth2LogoutView

logger = logging.getLogger(__name__)

NEXT_URL_COOKIE_NAME = "adfs_logout_next_url"


class KesaseteliADFSLogoutView(OAuth2LogoutView):
    def get(self, request, *args, **kwargs):
        next_url = request.GET.get("next")
        response = super().get(request, *args, **kwargs)

        if next_url and url_has_allowed_host_and_scheme(
            url=next_url,
            allowed_hosts={request.get_host()},
            require_https=request.is_secure(),
        ):
            response.set_cookie(
                NEXT_URL_COOKIE_NAME,
                next_url,
                max_age=60 * 5,  # 5 minutes
                secure=settings.SESSION_COOKIE_SECURE,
                httponly=True,
                samesite=settings.SESSION_COOKIE_SAMESITE,
            )
        return response


class KesaseteliADFSLogoutCallbackView(View):
    def get(self, request, *args, **kwargs):
        next_url = request.COOKIES.get(NEXT_URL_COOKIE_NAME)

        target_url = "/"
        if next_url and url_has_allowed_host_and_scheme(
            url=next_url,
            allowed_hosts={request.get_host()},
            require_https=request.is_secure(),
        ):
            target_url = next_url

        response = redirect(target_url)
        if next_url:
            response.delete_cookie(NEXT_URL_COOKIE_NAME)
        return response
