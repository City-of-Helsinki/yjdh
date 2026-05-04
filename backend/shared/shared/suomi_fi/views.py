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
        if relay_state and is_safe_redirect_url(self.request, relay_state):
            self.request.session["eauth_next_url"] = relay_state
        return reverse("eauth_authentication_init")

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
        if relay_state and is_safe_redirect_url(request, relay_state):
            return HttpResponseRedirect(relay_state)

        return super().handle_acs_failure(request, exception, status, **kwargs)


class HelsinkiSaml2LogoutView(LogoutInitView):
    """
    SAML2 Logout INITIATOR view.

    This is the "Entry Door": it is called by the frontend to start the logout.
    It captures the 'next' redirect URL and stashes it in the session before
    redirecting the user to the IdP (Suomi.fi).
    """

    def get(self, request, *args, **kwargs):
        # Capture 'next' parameter so it can be used on failure.
        # RELAY_STATE_PARAM is also checked as a fallback for standard SAML logout.
        self.next_path = (
            request.GET.get(REDIRECT_FIELD_NAME)
            or request.GET.get(RELAY_STATE_PARAM)
            or request.POST.get(RELAY_STATE_PARAM)
        )
        if self.next_path and is_safe_redirect_url(request, self.next_path):
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
            and is_safe_redirect_url(request, self.next_path)
        ):
            return HttpResponseRedirect(self.next_path)
        return super().handle_unsupported_slo_exception(
            request, exception, *args, **kwargs
        )


class HelsinkiSaml2LogoutServiceView(LogoutView):
    """
    SAML2 Logout CALLBACK view (Single Logout Service / SLS).

    This is the "Return Door": it is called by the IdP (Suomi.fi) after the
    logout is finished on their end. It recovers the 'next' URL from the
    session to ensure the user is returned to the correct frontend page.
    """

    def _handle_response(self, request, response):
        """
        Intercept the final response from djangosaml2's LogoutView to fix a known
        routing issue during the SAML Single Logout (SLO) flow.

        Why this is needed:
        1. When initiating the logout, pysaml2 internally populates the SAML
           `RelayState` parameter with a generated request ID (e.g. `id-slRc7Ma...`)
           rather than the actual `next` redirect URL.
        2. When the user returns from the IdP, djangosaml2's `LogoutView` attempts
           to use this `RelayState` as the literal URL to redirect to.
        3. Because the `RelayState` ID is not a valid URL, djangosaml2's strict URL
           validation rejects it and forces a fallback to the `LOGOUT_REDIRECT_URL`.

        To circumvent this, we capture the `next` URL in the session during logout
        initiation. Here, we pop it back out, wait for djangosaml2 to predictably
        fail and yield the fallback URL, and then replace it with our desired `next`
        destination (provided it passes security checks).
        """
        next_path = request.session.pop("saml2_logout_next_path", None)
        if next_path and isinstance(response, HttpResponseRedirect):
            fallback_url = resolve_url(getattr(settings, "LOGOUT_REDIRECT_URL", "/"))
            if response.url == fallback_url:
                if is_safe_redirect_url(request, next_path):
                    return HttpResponseRedirect(next_path)
        return response

    def get(self, request, *args, **kwargs):
        response = super().get(request, *args, **kwargs)
        return self._handle_response(request, response)

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        return self._handle_response(request, response)


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
