# -*- coding: utf-8 -*-

import collections
import contextlib
import threading

__all__ = ["call_now_or_later", "do_delayed_calls_at_end"]

_local = threading.local()

_sentinel = object()


def _get_pending_calls():
    if not hasattr(_local, "pending_calls"):
        _local.pending_calls = None
    return _local.pending_calls


def call_now_or_later(func, duplicate_check=None):
    if _get_pending_calls() is None:
        func()
    else:
        if duplicate_check is None:
            duplicate_check = (
                _sentinel,
                len(_get_pending_calls()),
                func.__name__,
            )  # unique
        _get_pending_calls()[duplicate_check] = func


def _call_all_pending():
    if _get_pending_calls() is None:
        raise Exception("This function must be used only with update_at_end")
    for k, func in list(_get_pending_calls().items()):
        func()
    _get_pending_calls().clear()


@contextlib.contextmanager
def do_delayed_calls_at_end():
    # can be used both as context manager and decorator, like:
    # @update_at_end()
    # def foo():
    #     ...
    if _get_pending_calls() is not None:
        raise Exception(
            "Nested update_at_end not supported - need to use contextlib.ContextDecorator"
        )
    _local.pending_calls = collections.OrderedDict()
    try:
        yield
        _call_all_pending()
    finally:
        # finally block is executed if wrapped function throws when using as a decorator
        _local.pending_calls = None


def is_updates_pending():
    return _get_pending_calls() is not None and len(_get_pending_calls()) > 0
