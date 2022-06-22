from django.http import HttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.generic import View
from rest_framework import status


class MockSuomiFiSAML2AuthenticationRequestView(View):
    """Mocked Suomi.fi SAML2 client authentication HTTP endpoint"""

    http_method_names = ["get"]

    @method_decorator(ensure_csrf_cookie)
    def get(self, request, *args, **kwargs):
        # TODO: Implement
        return HttpResponse(status=status.HTTP_501_NOT_IMPLEMENTED)
