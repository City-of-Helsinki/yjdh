"""OpenAPI documentation views with per-route CSP for Swagger UI and ReDoc."""

from csp.constants import SELF, UNSAFE_INLINE
from csp.decorators import csp_update
from django.utils.decorators import method_decorator
from drf_spectacular.views import SpectacularRedocView, SpectacularSwaggerView

# CDN requirements for drf-spectacular's default Swagger UI and ReDoc templates.
# https://drf-spectacular.readthedocs.io/en/latest/faq.html#my-swagger-ui-and-or-redoc-page-is-blank
API_DOCS_CSP = {
    "script-src": [SELF, UNSAFE_INLINE, "cdn.jsdelivr.net"],
    "worker-src": [SELF, "blob:"],
    "img-src": [SELF, "data:", "cdn.jsdelivr.net", "cdn.redoc.ly"],
    "style-src": [SELF, UNSAFE_INLINE, "cdn.jsdelivr.net", "fonts.googleapis.com"],
    "font-src": [SELF, "fonts.gstatic.com"],
}


@method_decorator(csp_update(API_DOCS_CSP), name="dispatch")
class KesaseteliSwaggerView(SpectacularSwaggerView):
    pass


@method_decorator(csp_update(API_DOCS_CSP), name="dispatch")
class KesaseteliRedocView(SpectacularRedocView):
    pass
