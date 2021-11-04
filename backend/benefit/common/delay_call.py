# -*- coding: utf-8 -*-

import collections
import contextlib
import threading

__all__ = ["call_now_or_later", "do_delayed_calls_at_end"]

_local = threading.local()
_local.pending_calls = None

_sentinel = object()


def call_now_or_later(func, duplicate_check=None):
    if _local.pending_calls is None:
        func()
    else:
        if duplicate_check is None:
            duplicate_check = (
                _sentinel,
                len(_local.pending_calls),
                func.__name__,
            )  # unique
        _local.pending_calls[duplicate_check] = func


def _call_all_pending():
    if _local.pending_calls is None:
        raise Exception("This function must be used only with update_at_end")
    for k, func in list(_local.pending_calls.items()):
        func()
    _local.pending_calls.clear()


@contextlib.contextmanager
def do_delayed_calls_at_end():
    # can be used both as context manager and decorator, like:
    # @update_at_end()
    # def foo():
    #     ...
    if _local.pending_calls is not None:
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
    return _local.pending_calls is not None and len(_local.pending_calls) > 0
