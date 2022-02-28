from functools import wraps
from typing import Callable, Iterable, Optional, Type

from django.contrib.auth import REDIRECT_FIELD_NAME
from django.http.request import HttpRequest
from django.http.response import HttpResponse, HttpResponseBase
from rest_framework import status
from rest_framework.permissions import BasePermission

from shared.common.utils import redirect_to_login_using_request


def set_use_original_redirect_url_into_session(request: HttpRequest) -> None:
    """
    Set request.session["USE_ORIGINAL_REDIRECT_URL"] to True
    """
    request.session["USE_ORIGINAL_REDIRECT_URL"] = True


def is_request_user_unauthenticated(request: HttpRequest) -> bool:
    """
    Is the request's user unauthenticated i.e. not authenticated?

    :return: True if request has no user or the user is not authenticated, otherwise
             False.
    """
    return not bool(request.user and request.user.is_authenticated)


def permit_view_if_permissions_or_redirect(
    permission_classes: Iterable[Type[BasePermission]],
    login_url=None,
    redirect_field_name=REDIRECT_FIELD_NAME,
    redirect_only_if_func: Optional[Callable[[HttpRequest], bool]] = None,
    run_before_redirect_func: Optional[Callable[[HttpRequest], None]] = None,
    forbidden_response_func: Optional[Callable[[HttpRequest], HttpResponseBase]] = None,
):
    """
    Decorator for permitting a view if all permissions pass, otherwise redirecting to
    login URL with optional check (e.g. to remove redirection loops) and side effect
    (e.g. set session variables) function calls before redirection. If not all
    permissions pass nor redirection is taken then returns 403 Forbidden.

    :param permission_classes: The permission classes as in Django REST Framework, e.g.
                               [IsAuthenticated | ReadOnly]
    :param login_url: Login URL to be redirected to in case at least one permission
                      doesn't pass
    :param redirect_field_name: Name of the URL parameter to pass the current URL in
    :param redirect_only_if_func: Function to check if redirecting should be done when
                                  user does not pass all the permissions. The default
                                  value is None which means redirecting should always be
                                  done when user does not pass all the permissions.
    :param run_before_redirect_func: Function to run before redirection, e.g. to set a
                                     value in request's session.
    :param forbidden_response_func: Function to generate the response to return if not
                                    all permissions pass nor redirection is taken. The
                                    default value is None which means that a response
                                    with status 403 Forbidden is returned.
    """

    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(view, request, *args, **kwargs):
            # Instantiate the permissions
            permissions = [permission() for permission in permission_classes]
            is_authorized = all(
                permission.has_permission(request, view) for permission in permissions
            )
            if is_authorized:
                return view_func(view, request, *args, **kwargs)
            elif redirect_only_if_func is None or redirect_only_if_func(request):
                # Redirect
                if callable(run_before_redirect_func):
                    run_before_redirect_func(request)
                return redirect_to_login_using_request(
                    request, login_url, redirect_field_name
                )
            else:
                # Forbidden
                if callable(forbidden_response_func):
                    return forbidden_response_func(request)
                else:
                    return HttpResponse(status=status.HTTP_403_FORBIDDEN)

        return _wrapped_view

    return decorator
