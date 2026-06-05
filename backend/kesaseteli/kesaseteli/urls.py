from django.conf import settings
from django.contrib import admin
from django.urls import include, path, reverse_lazy
from django.views.generic import RedirectView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework import routers

from applications.api.handler_excel_views import (
    EmployerApplicationExcelExportView,
    YouthApplicationExcelExportViewSet,
)
from applications.api.v1 import views as application_views
from applications.views import EmployerExcelDownloadPageView
from common.decorators import enforce_handler_view_adfs_login
from common.views import healthz, readiness
from companies.api.v1.views import GetCompanyView
from shared.suomi_fi.views import (
    HelsinkiSaml2LogoutServiceView,
    HelsinkiSaml2LogoutView,
    SuomiFiAssertionConsumerServiceView,
    SuomiFiMetadataView,
)

router = routers.DefaultRouter()
router.register(r"employerapplications", application_views.EmployerApplicationViewSet)

v1_patterns = [
    # Dedicated Youth Application endpoints
    path(
        "youthapplications/",
        application_views.YouthApplicationCreateView.as_view(),
        name="youthapplication-list",
    ),
    path(
        "youthapplications/<uuid:pk>/",
        application_views.YouthApplicationDetailView.as_view(),
        name="youthapplication-detail",
    ),
    path(
        "youthapplications/create-without-ssn/",
        application_views.YouthApplicationCreateWithoutSsnView.as_view(),
        name="youthapplication-create-without-ssn",
    ),
    path(
        "youthapplications/fetch_employee_data/",
        application_views.YouthApplicationFetchEmployeeDataView.as_view(),
        name="youthapplication-fetch-employee-data",
    ),
    path(
        "youthapplications/<uuid:pk>/status/",
        application_views.YouthApplicationStatusView.as_view(),
        name="youthapplication-status",
    ),
    path(
        "youthapplications/<uuid:pk>/process/",
        application_views.YouthApplicationProcessView.as_view(),
        name="youthapplication-process",
    ),
    path(
        "youthapplications/<uuid:pk>/additional_info/",
        application_views.YouthApplicationAdditionalInfoView.as_view(),
        name="youthapplication-additional-info",
    ),
    path(
        "youthapplications/<uuid:pk>/accept/",
        application_views.YouthApplicationAcceptView.as_view(),
        name="youthapplication-accept",
    ),
    path(
        "youthapplications/<uuid:pk>/reject/",
        application_views.YouthApplicationRejectView.as_view(),
        name="youthapplication-reject",
    ),
    path(
        "youthapplications/<uuid:pk>/activate/",
        application_views.YouthApplicationActivateView.as_view(),
        name="youthapplication-activate",
    ),

    # Dedicated Employer Summer Voucher Attachment endpoints
    path(
        "employersummervouchers/<uuid:pk>/attachments/",
        application_views.EmployerSummerVoucherAttachmentView.as_view(),
        name="employersummervoucher-post-attachment",
    ),
    path(
        "employersummervouchers/<uuid:pk>/attachments/<uuid:attachment_pk>/",
        application_views.EmployerSummerVoucherAttachmentDetailView.as_view(),
        name="employersummervoucher-handle-attachment",
    ),

    path("", include(router.urls)),
]

urlpatterns = [
    path("v1/", include((v1_patterns, "v1"), namespace="v1")),
    path("v1/company/", GetCompanyView.as_view(), name="company"),
    path("v1/schools/", application_views.SchoolListView.as_view(), name="school-list"),
    path(
        "v1/target_groups/",
        application_views.TargetGroupListView.as_view(),
        name="target-group-list",
    ),
    path(
        "v1/summer_voucher_configuration/",
        application_views.SummerVoucherConfigurationViewSet.as_view(),
        name="summer-voucher-configuration",
    ),
    path("oidc/", include("shared.oidc.urls")),
    path("oauth2/", include("shared.azure_adfs.urls")),
    path(
        "excel-download/",
        EmployerExcelDownloadPageView.as_view(),
        name="excel-download",
    ),
    path(
        "excel-download/employer-applications/<str:export_kind>/<str:columns>/",
        EmployerApplicationExcelExportView.as_view(),
        name="employer-excel-export",
    ),
    path(
        "excel-download/confirmed-youth-applications/",
        YouthApplicationExcelExportViewSet.as_view({"get": "list"}),
        name="youth-excel-download",
    ),
    path(
        "logout/",
        RedirectView.as_view(
            url=reverse_lazy("django_auth_adfs:logout"), query_string=True
        ),
        name="logout",
    ),
    path("openapi/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api_docs/swagger/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api_docs/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
]

if settings.NEXT_PUBLIC_ENABLE_SUOMIFI:
    urlpatterns.append(
        path(
            "saml2/acs/",
            SuomiFiAssertionConsumerServiceView.as_view(),
            name="saml2_acs",
        )
    )
    urlpatterns.append(
        path(
            "saml2/metadata/",
            SuomiFiMetadataView.as_view(),
            name="saml2_metadata",
        )
    )
    urlpatterns.append(
        path(
            "saml2/logout/",
            HelsinkiSaml2LogoutView.as_view(),
            name="saml2_logout",
        )
    )

    urlpatterns.append(
        path(
            "saml2/ls/",
            HelsinkiSaml2LogoutServiceView.as_view(),
            name="saml2_ls",
        )
    )
    urlpatterns.append(
        path(
            "saml2/ls/post/",
            HelsinkiSaml2LogoutServiceView.as_view(),
            name="saml2_ls_post",
        )
    )
    urlpatterns.append(path("saml2/", include("djangosaml2.urls")))


if settings.ENABLE_ADMIN:
    urlpatterns.append(path("admin/", admin.site.urls))


#
# Kubernetes liveness & readiness probes
#
urlpatterns += [
    path("healthz", healthz, name="healthz"),
    path("readiness", readiness, name="readiness"),
]
