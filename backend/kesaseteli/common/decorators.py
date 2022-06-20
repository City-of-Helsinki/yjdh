from functools import partial

from django.http import HttpRequest, HttpResponse
from django.shortcuts import redirect
from rest_framework.reverse import reverse_lazy

from common.permissions import HandlerPermission
from common.urls import handler_403_url
from shared.common.decorators import (
    is_request_user_unauthenticated,
    permit_view_if_permissions_or_redirect,
    set_use_original_redirect_url_into_session,
)


def redirect_to_handler_403_url(request: HttpRequest) -> HttpResponse:
    return redirect(handler_403_url())


#: Decorator for enforcing handler view's ADFS login before permitting access
enforce_handler_view_adfs_login = partial(
    permit_view_if_permissions_or_redirect(
        permission_classes=[HandlerPermission],
        login_url=reverse_lazy("django_auth_adfs:login"),
        redirect_only_if_func=is_request_user_unauthenticated,  # Don't loop redirect
        run_before_redirect_func=set_use_original_redirect_url_into_session,
        forbidden_response_func=redirect_to_handler_403_url,
    )
)
