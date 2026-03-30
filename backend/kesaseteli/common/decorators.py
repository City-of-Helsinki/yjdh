from functools import partial

from django.http import HttpRequest, HttpResponse
from django.shortcuts import redirect
from django.utils.translation import gettext_lazy as _
from rest_framework import status
from rest_framework.exceptions import NotAuthenticated, PermissionDenied
from rest_framework.response import Response
from rest_framework.reverse import reverse_lazy

from common.permissions import HandlerPermission
from common.urls import handler_403_url
from shared.common.decorators import (
    is_request_user_unauthenticated,
    permit_view_if_permissions_or_redirect,
    set_use_original_redirect_url_into_session,
)


def is_api_request(request: HttpRequest) -> bool:
    """
    Is the request an API request?
    Checks for "application/json" in the "Accept" header to distinguish between
    AJAX requests from the frontend and regular browser navigations.
    """
    return "application/json" in request.headers.get("Accept", "")


def redirect_to_handler_403_url() -> HttpResponse:
    """
    Redirect to handlers' 403 page.
    """
    return redirect(handler_403_url())


def forbidden_handler_view_response(request: HttpRequest) -> HttpResponse:
    """
    Return forbidden response for handler views.
    """
    if is_api_request(request):
        if is_request_user_unauthenticated(request):
            return Response(
                status=status.HTTP_401_UNAUTHORIZED,
                data={
                    "detail": _("Authentication credentials were not provided."),
                    "code": NotAuthenticated.default_code,
                },
            )
        return Response(
            status=status.HTTP_403_FORBIDDEN,
            data={
                "detail": _("You do not have permission to view this page."),
                "code": PermissionDenied.default_code,
            },
        )
    return redirect_to_handler_403_url()


#: Decorator for enforcing handler view's ADFS login before permitting access
enforce_handler_view_adfs_login = partial(
    permit_view_if_permissions_or_redirect(
        permission_classes=[HandlerPermission],
        login_url=reverse_lazy("django_auth_adfs:login"),
        redirect_only_if_func=lambda r: is_request_user_unauthenticated(r)
        and not is_api_request(r),
        run_before_redirect_func=set_use_original_redirect_url_into_session,
        forbidden_response_func=forbidden_handler_view_response,
    )
)
