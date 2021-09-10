import functools
import pdb
import traceback

from rest_framework.views import exception_handler


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
