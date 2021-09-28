import functools
import os
import pdb
import traceback

from django.conf import settings
from django.http import HttpResponse, HttpResponseServerError
from rest_framework.views import exception_handler


def _debug_dict(mapping):
    sensitive_keys = ["password", "secret", "private", "token"]
    lines = []
    for k, v in sorted(mapping.items()):
        if any(item in k.lower() for item in sensitive_keys):
            v = "***" if v else ""
        lines.append(f"{k}={v}")
    return lines


def debug_env(request):
    if not settings.ENABLE_DEBUG_ENV:
        raise HttpResponseServerError("Configuration error")

    lines = (
        _debug_dict(request.headers) + ["", "ENVIRONMENT:"] + _debug_dict(os.environ)
    )

    return HttpResponse("\n".join(lines), content_type="text/plain")


def debug_on_exception(func):
    """
    launch debugger on exception. Useful while debugging.
    """

    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception:
            traceback.print_exc()
            pdb.post_mortem()
            raise

    return wrapper


def rest_framework_debug_exception_handler(exc, context):
    """
    Enable in settings.py like this:
    REST_FRAMEWORK = {
        'EXCEPTION_HANDLER': 'common.debug_util.rest_framework_debug_exception_handler',
        ...
    }
    """
    pdb.post_mortem()
    # Call REST framework's default exception handler to get the standard error response.
    return exception_handler(exc, context)
