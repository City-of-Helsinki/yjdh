from django.conf import settings
from django.contrib import admin
from django.contrib.auth.views import LogoutView
from django.http import HttpResponse
from django.urls import include, path
from rest_framework import routers

from applications.api.v1 import views as application_views
from applications.views import ApplicationExcelDownloadView
from companies.api.v1.views import GetCompanyView

router = routers.DefaultRouter()
router.register(r"applications", application_views.ApplicationViewSet)
router.register(r"youthapplications", application_views.YouthApplicationViewSet)
router.register(r"summervouchers", application_views.SummerVoucherViewSet)

urlpatterns = [
    path("v1/", include((router.urls, "v1"), namespace="v1")),
    path("v1/company/", GetCompanyView.as_view()),
    path("oidc/", include("shared.oidc.urls")),
    path("oauth2/", include("shared.azure_adfs.urls")),
    path(
        "excel-download/", ApplicationExcelDownloadView.as_view(), name="excel-download"
    ),
    path("logout/", LogoutView.as_view(), name="logout"),
]


if settings.ENABLE_ADMIN:
    urlpatterns.append(path("admin/", admin.site.urls))


#
# Kubernetes liveness & readiness probes
#
def healthz(*args, **kwargs):
    return HttpResponse(status=200)


def readiness(*args, **kwargs):
    return HttpResponse(status=200)


urlpatterns += [path("healthz", healthz), path("readiness", readiness)]
