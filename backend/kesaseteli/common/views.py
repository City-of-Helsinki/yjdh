"""
Kubernetes liveness and readiness probe endpoints.

These endpoints are used by OpenShift/Kubernetes to determine pod health.
"""

from django.conf import settings
from django.db import connection
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods

from kesaseteli import __version__ as package_version


def _check_database() -> str:
    """
    Check database connectivity with a minimal query.

    :return: "ok" if the database is reachable, "error" otherwise.
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return "ok"
    except Exception:
        return "error"


@require_http_methods(["GET", "HEAD"])
def healthz(request):
    """
    Liveness probe. Returns 200 with empty body.

    Does not check dependencies; used to confirm the process is alive.
    """
    return HttpResponse(status=200)


@require_http_methods(["GET", "HEAD"])
def readiness(request):
    """
    Readiness probe. Checks database and returns deployment metadata.

    Returns 200 when the database is reachable, 503 when it is not.
    Response JSON includes status, packageVersion, release, buildTime, and database.
    """
    db_status = _check_database()
    readiness_status = "ok" if db_status == "ok" else "error"
    build_time = getattr(settings, "APP_BUILD_TIME", None)

    return JsonResponse(
        {
            "status": readiness_status,
            "packageVersion": package_version,
            "release": settings.APP_RELEASE or "",
            "buildTime": build_time.isoformat() if build_time else None,
            "database": db_status,
        },
        status=200 if readiness_status == "ok" else 503,
    )
