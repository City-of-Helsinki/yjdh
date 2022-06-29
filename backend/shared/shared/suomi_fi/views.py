from django.conf import settings
from django.http import HttpRequest, HttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from djangosaml2.views import AssertionConsumerServiceView, MetadataView
from saml2.md import ServiceName
from saml2.metadata import entity_descriptor


@method_decorator(csrf_exempt, name="dispatch")
class SuomiFiAssertionConsumerServiceView(AssertionConsumerServiceView):
    """
    Store user's national identification number into session instead of any User model.
    """

    def post_login_hook(
        self, request: HttpRequest, user: settings.AUTH_USER_MODEL, session_info: dict
    ) -> None:
        """Pick national identification number from ava and put it to the session."""
        ava = session_info.get("ava", {})

        if user_ssn := ava.get("nationalIdentificationNumber"):
            request.saml_session["national_id_num"] = user_ssn[0]

        super(SuomiFiAssertionConsumerServiceView, self).post_login_hook(
            request, user, session_info
        )


class SuomiFiMetadataView(MetadataView):
    """
    Returns an XML with the SAML 2.0 metadata for this SP as
    configured in the settings.py file.
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
