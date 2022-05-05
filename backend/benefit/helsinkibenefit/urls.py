from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import HttpResponse
from django.urls import include, path
from django.views.decorators.http import require_GET
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework_nested import routers

from applications.api.v1 import application_batch_views, views as application_views
from calculator.api.v1 import views as calculator_views
from common.debug_util import debug_env
from companies.api.v1.views import GetCompanyView
from messages.views import (
    ApplicantMessageViewSet,
    HandlerMessageViewSet,
    HandlerNoteViewSet,
)
from terms.api.v1.views import ApproveTermsOfServiceView
from users.api.v1.views import CurrentUserView

router = routers.DefaultRouter()
router.register(
    r"applications",
    application_views.ApplicantApplicationViewSet,
    basename="applicant-application",
)

applicant_app_router = routers.NestedSimpleRouter(
    router, r"applications", lookup="application"
)
applicant_app_router.register(
    r"messages", ApplicantMessageViewSet, basename="applicant-message"
)

router.register(
    r"handlerapplications",
    application_views.HandlerApplicationViewSet,
    basename="handler-application",
)

handler_app_router = routers.NestedSimpleRouter(
    router, r"handlerapplications", lookup="application"
)
handler_app_router.register(
    r"messages", HandlerMessageViewSet, basename="handler-message"
)
handler_app_router.register(r"notes", HandlerNoteViewSet, basename="handler-note")

router.register(r"applicationbatches", application_batch_views.ApplicationBatchViewSet)
router.register(r"previousbenefits", calculator_views.PreviousBenefitViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("v1/", include((router.urls, "v1"), namespace="v1")),
    path("v1/", include(applicant_app_router.urls)),
    path("v1/", include(handler_app_router.urls)),
    path("v1/terms/approve_terms_of_service/", ApproveTermsOfServiceView.as_view()),
    path("v1/company/", GetCompanyView.as_view()),
    path("v1/users/me/", CurrentUserView.as_view()),
    path("oidc/", include("shared.oidc.urls")),
    path("oauth2/", include("shared.azure_adfs.urls")),
    path("api-auth/", include("rest_framework.urls", namespace="rest_framework")),
    path("openapi/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api_docs/swagger/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api_docs/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"
    ),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.ENABLE_DEBUG_ENV:
    urlpatterns.append(path("debug_env", debug_env))

# Kubernetes liveness & readiness probes


@require_GET
def healthz(*args, **kwargs):
    return HttpResponse(status=200)


@require_GET
def readiness(*args, **kwargs):
    return HttpResponse(status=200)


urlpatterns += [path("healthz", healthz), path("readiness", readiness)]
