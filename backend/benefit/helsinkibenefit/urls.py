from companies.api.v1.views import GetCompanyView
from django.contrib import admin
from django.http import HttpResponse
from django.urls import include, path
from rest_framework import routers

router = routers.DefaultRouter()

urlpatterns = [
    path("admin/", admin.site.urls),
    path("v1/", include((router.urls, "v1"), namespace="v1")),
    path("v1/company/<str:business_id>", GetCompanyView.as_view()),
]


#
# Kubernetes liveness & readiness probes
#
def healthz(*args, **kwargs):
    return HttpResponse(status=200)


def readiness(*args, **kwargs):
    return HttpResponse(status=200)


urlpatterns += [path("healthz", healthz), path("readiness", readiness)]
