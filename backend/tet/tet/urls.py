from django.contrib import admin
from django.http import HttpResponse, JsonResponse
from django.urls import include, path
from django.views.decorators.http import require_GET
from rest_framework import routers

from events.api.v1 import views as event_views

router = routers.DefaultRouter()
router.register(r"events", event_views.JobPostingsViewSet, basename="jobpostings")

urlpatterns = [
    path("v1/", include((router.urls, "v1"), namespace="v1")),
    path("oidc/", include("shared.oidc.urls")),
    path("oauth2/", include("shared.azure_adfs.urls")),
    path("admin/", admin.site.urls),
]

# urlpatterns += router.urls


@require_GET
def healthz_handler(*args, **kwargs):
    return HttpResponse(status=200)


@require_GET
def readiness_handler(*args, **kwargs):
    return HttpResponse(status=200)


urlpatterns += [path("healthz", healthz_handler), path("readiness", readiness_handler)]


def posting_object(p):
    return {
        "id": p["id"],
        "org_name": p.get("org_name") or "Helsingin kaupunki",
        "title": p.get("title") or "Testipaikka",
        "start_date": p.get("start_date") or "2022-02-01",
        "end_date": p.get("end_date"),
        "spots": p.get("spots") or 2,
        "description": p.get("description") or "TET-paikan kuvaus",
        "contact_first_name": p.get("contact_first_name") or "John",
        "contact_last_name": p.get("contact_last_name") or "Doe",
        "contact_email": p.get("contact_email") or "john.doe@example.com",
        "contact_phone": p.get("contact_phone") or "0401234567",
        "contact_language": p.get("contact_language") or "fi",
        "date_published": p.get("date_published"),
    }


@require_GET
def postings_stub(request, *args, **kwargs):
    return JsonResponse(
        {
            "published": [
                posting_object(dict(id="21", date_published="2022-01-20")),
                posting_object(dict(id="22", date_published="2022-01-20")),
                posting_object(dict(id="23", date_published="2022-01-20")),
            ],
            "draft": [
                posting_object(dict(id="31", end_date="2022-02-05", spots=1)),
                posting_object(dict(id="32")),
                posting_object(dict(id="33")),
            ],
        }
    )


@require_GET
def postings_ended_stub(request, *args, **kwargs):
    page = request.GET.get("page")
    if page == "2":
        return JsonResponse(
            {
                "meta": {
                    "count": 3,
                    "next": None,
                    "previous": request.path + "?page=1",
                },
                "data": [
                    posting_object(dict(id="44")),
                    posting_object(dict(id="45")),
                    posting_object(dict(id="46")),
                ],
            }
        )

    return JsonResponse(
        {
            "meta": {"count": 3, "next": request.path + "?page=2", "previous": None},
            "data": [
                posting_object(dict(id="41")),
                posting_object(dict(id="42")),
                posting_object(dict(id="43")),
            ],
        }
    )


urlpatterns += [
    path("tet/postings", postings_stub),
    path("tet/postings/ended", postings_ended_stub),
]
