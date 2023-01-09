from django.conf import settings
from django.contrib import admin
from django.contrib.auth.views import LogoutView
from django.http import HttpResponse
from django.urls import include, path
from rest_framework import routers

from applications.api.v1 import views as application_views
from applications.views import (
    EmployerApplicationExcelDownloadView,
    YouthApplicationExcelExportViewSet,
)
from companies.api.v1.views import GetCompanyView
from shared.suomi_fi.views import (
    SuomiFiAssertionConsumerServiceView,
    SuomiFiMetadataView,
)

router = routers.DefaultRouter()
router.register(r"employerapplications", application_views.EmployerApplicationViewSet)
router.register(r"youthapplications", application_views.YouthApplicationViewSet)
router.register(
    r"employersummervouchers", application_views.EmployerSummerVoucherViewSet
)

urlpatterns = [
    path("v1/", include((router.urls, "v1"), namespace="v1")),
    path("v1/company/", GetCompanyView.as_view()),
    path("v1/schools/", application_views.SchoolListView.as_view()),
    path("oidc/", include("shared.oidc.urls")),
    path("oauth2/", include("shared.azure_adfs.urls")),
    path(
        "excel-download/",
        EmployerApplicationExcelDownloadView.as_view(),
        name="excel-download",
    ),
    path(
        "excel-download/confirmed-youth-applications/",
        YouthApplicationExcelExportViewSet.as_view({"get": "list"}),
        name="youth-excel-download",
    ),
    path("logout/", LogoutView.as_view(), name="logout"),
]

if settings.NEXT_PUBLIC_ENABLE_SUOMIFI:
    urlpatterns.append(
        path(
            "saml2/acs/",
            SuomiFiAssertionConsumerServiceView.as_view(),
            name="suomifi_saml2_acs",
        )
    )
    urlpatterns.append(
        path(
            "saml2/metadata/",
            SuomiFiMetadataView.as_view(),
            name="suomifi_saml2_metadata",
        )
    )
    urlpatterns.append(path("saml2/", include("djangosaml2.urls")))


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
