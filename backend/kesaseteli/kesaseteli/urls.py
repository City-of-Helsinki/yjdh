from django.contrib import admin
from django.http import HttpResponse
from django.urls import include, path
from rest_framework import routers

from applications.api.v1 import views as application_views
from companies.api.v1.views import GetCompanyView

router = routers.DefaultRouter()
router.register(r"applications", application_views.ApplicationViewSet)
router.register(r"summervouchers", application_views.SummerVoucherViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("v1/", include((router.urls, "v1"), namespace="v1")),
    path("v1/company/", GetCompanyView.as_view()),
    path("oidc/", include("shared.oidc.urls")),
    path("oauth2/", include("shared.azure_adfs.urls")),
]


#
# Kubernetes liveness & readiness probes
#
def healthz(*args, **kwargs):
    return HttpResponse(status=200)


def readiness(*args, **kwargs):
    return HttpResponse(status=200)


urlpatterns += [path("healthz", healthz), path("readiness", readiness)]
