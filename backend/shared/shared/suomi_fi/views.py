from django.conf import settings
from django.contrib.auth import REDIRECT_FIELD_NAME
from django.http import HttpRequest, HttpResponse, HttpResponseRedirect
from django.shortcuts import resolve_url
from django.urls import reverse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from djangosaml2.views import (
    AssertionConsumerServiceView,
    LogoutInitView,
    LogoutView,
    MetadataView,
)
from saml2.md import ServiceName
from saml2.metadata import entity_descriptor

from shared.common.utils import is_safe_redirect_url

# "RelayState" is a standard SAML parameter name and no constant is exported
# for it in djangosaml2 or pysaml2.
RELAY_STATE_PARAM = "RelayState"


@method_decorator(csrf_exempt, name="dispatch")
class SuomiFiAssertionConsumerServiceView(AssertionConsumerServiceView):
    """
    Store user's national identification number into session instead of any
    User model.
    """

    def post_login_hook(
        self, request: HttpRequest, user: settings.AUTH_USER_MODEL, session_info: dict
    ) -> None:
        """
        Pick national identification number from ava and put it to the session.
        """
        ava = session_info.get("ava", {})

        if user_ssn := ava.get("nationalIdentificationNumber"):
            request.saml_session["national_id_num"] = user_ssn[0]

        super(SuomiFiAssertionConsumerServiceView, self).post_login_hook(
            request, user, session_info
        )

    def custom_redirect(self, user, relay_state: str, session_info) -> str:
        """
        Intercept the validated `RelayState` and manually route the user completely
        through the eAuthorizations pipeline before allowing the final redirect.
        """
        eauth_init_url = reverse("eauth_authentication_init")
        if relay_state and is_safe_redirect_url(
            self.request, relay_state, allowed_hosts=settings.SAML_ALLOWED_HOSTS
        ):
            # Do not store the eAuthorizations initiation URL as the next URL,
            # as it would cause a redirect loop.
            if relay_state.rstrip("/") != eauth_init_url.rstrip("/"):
                self.request.session["eauth_next_url"] = relay_state
        return eauth_init_url

    def handle_acs_failure(self, request, exception=None, status=403, **kwargs):
        """
        Redirect back to the RelayState if it exists and is safe, instead of showing
        the default error page. This handles cases like user cancelling the
        authentication at Suomi.fi.

        NOTE: "RelayState" is a standard SAML parameter name.
        """
        relay_state = request.POST.get(RELAY_STATE_PARAM) or request.GET.get(
            RELAY_STATE_PARAM
        )
        if relay_state and is_safe_redirect_url(
            request, relay_state, allowed_hosts=settings.SAML_ALLOWED_HOSTS
        ):
            return HttpResponseRedirect(relay_state)

        return super().handle_acs_failure(request, exception, status, **kwargs)


class HelsinkiSaml2LogoutView(LogoutInitView):
    """
    SAML2 Logout INITIATOR view.

    This is the "Entry Door": it is called by the frontend to start the logout.
    It captures the 'next' redirect URL and stashes it in the session before
    redirecting the user to the IdP (Suomi.fi).
    """

    def get_relay_state(self, request):
        """
        Use 'next' path as RelayState so it survives if session is lost.
        """
        next_path = (
            request.GET.get(REDIRECT_FIELD_NAME)
            or request.GET.get(RELAY_STATE_PARAM)
            or request.POST.get(RELAY_STATE_PARAM)
        )
        if next_path and is_safe_redirect_url(
            request, next_path, allowed_hosts=settings.SAML_ALLOWED_HOSTS
        ):
            return next_path
        return ""

    def get(self, request, *args, **kwargs):
        # Capture 'next' parameter so it can be used on failure.
        # RELAY_STATE_PARAM is also checked as a fallback for standard SAML logout.
        self.next_path = self.get_relay_state(request)
        if self.next_path:
            request.session["saml2_logout_next_path"] = self.next_path

        return super().get(request, *args, **kwargs)

    def handle_unsupported_slo_exception(self, request, exception, *args, **kwargs):
        """
        Handle cases where the SAML logout fails to initiate (e.g., IdP doesn't
        support SLO or is unavailable). This ensures the user is still redirected
        to the 'next' URL instead of being dumped at the API root.
        """
        if (
            hasattr(self, "next_path")
            and self.next_path
            and is_safe_redirect_url(
                request, self.next_path, allowed_hosts=settings.SAML_ALLOWED_HOSTS
            )
        ):
            return HttpResponseRedirect(self.next_path)
        return super().handle_unsupported_slo_exception(
            request, exception, *args, **kwargs
        )


class HelsinkiSaml2LogoutServiceView(LogoutView):
    """
    SAML2 Logout CALLBACK view (Single Logout Service / SLS).

    Called by the IdP after logout. Recovers the 'next' URL from the session
    to return the user to the correct frontend page.

    pysaml2 sets RelayState to an internal request ID (not a URL), so
    djangosaml2's finish_logout always falls back to LOGOUT_REDIRECT_URL.
    We pop next_path from the session BEFORE super() calls auth.logout() and
    flushes it, then replace the fallback redirect with next_path.
    """

    def do_logout_service(self, request, data, binding, *args, **kwargs):
        # Pop next_path from session BEFORE super() calls auth.logout() and flushes it.
        next_path = request.session.pop("saml2_logout_next_path", None)

        response = super().do_logout_service(request, data, binding, *args, **kwargs)

        if isinstance(response, HttpResponseRedirect):
            # 1. If we have a stashed next_path, redirect to it (if safe)
            if next_path and is_safe_redirect_url(
                request, next_path, allowed_hosts=settings.SAML_ALLOWED_HOSTS
            ):
                return HttpResponseRedirect(next_path)

            # 2. Fallback workaround: If the response is a redirect to '/' (because
            # djangosaml2 rejected the off-domain LOGOUT_REDIRECT_URL), but
            # settings.LOGOUT_REDIRECT_URL is safe, redirect to it.
            fallback = getattr(settings, "LOGOUT_REDIRECT_URL", None)
            if response.url == "/" and fallback and fallback != "/" and is_safe_redirect_url(
                request, fallback, allowed_hosts=settings.SAML_ALLOWED_HOSTS
            ):
                return HttpResponseRedirect(fallback)

        return response


class SuomiFiMetadataView(MetadataView):
    """
    Returns an XML with the SAML 2.0 metadata for this SP as configured in the
    settings.py file.
    """

    def get(self, request, *args, **kwargs):
        conf = self.get_sp_config(request)
        metadata = entity_descriptor(conf)

        # Add translations for the ServiceName
        acs = metadata.spsso_descriptor.attribute_consuming_service[0]
        acs.service_name.extend(
            [
                ServiceName(text=settings.SUOMIFI_SERVICE_NAME_FI, lang="fi"),
                ServiceName(text=settings.SUOMIFI_SERVICE_NAME_SV, lang="sv"),
            ]
        )

        return HttpResponse(
            content=str(metadata).encode("utf-8"),
            content_type="text/xml; charset=utf-8",
        )
