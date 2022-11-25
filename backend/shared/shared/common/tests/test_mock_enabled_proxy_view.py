from collections import namedtuple

import pytest
from django.test import override_settings
from django.views import View

from shared.common.views import MockEnabledProxyView


class MockRequest:
    def __init__(self, method):
        self.method = method


ViewCallInfo = namedtuple(
    "ViewCallInfo", ["class_name", "called_method_name", "request", "args", "kwargs"]
)


class BaseTestView(View):
    @classmethod
    def _test_func(
        cls, called_method_name: str, request, *args, **kwargs
    ) -> ViewCallInfo:
        """
        Return class name, called method name, request, positional arguments and
        keyword arguments for testing purposes.
        """
        return ViewCallInfo(cls.__name__, called_method_name, request, args, kwargs)

    def get(self, request, *args, **kwargs) -> ViewCallInfo:
        return self.__class__._test_func("get", request, *args, **kwargs)

    def post(self, request, *args, **kwargs) -> ViewCallInfo:
        return self.__class__._test_func("post", request, *args, **kwargs)

    def http_method_not_allowed(self, request, *args, **kwargs) -> ViewCallInfo:
        return self.__class__._test_func(
            "http_method_not_allowed", request, *args, **kwargs
        )


class RealTestView(BaseTestView):
    pass


class MockTestView(BaseTestView):
    pass


@pytest.fixture
def mock_enabled_proxy_view():
    return MockEnabledProxyView(
        real_view_class=RealTestView, mock_view_class=MockTestView
    )


def test_view_class_with_inexistent_mock_flag(settings, mock_enabled_proxy_view):
    if hasattr(settings, "NEXT_PUBLIC_MOCK_FLAG"):
        delattr(settings, "NEXT_PUBLIC_MOCK_FLAG")

    assert not hasattr(settings, "NEXT_PUBLIC_MOCK_FLAG")
    assert mock_enabled_proxy_view.view_class == RealTestView


@override_settings(NEXT_PUBLIC_MOCK_FLAG=True)
def test_view_class_with_mock_flag_on(mock_enabled_proxy_view):
    assert mock_enabled_proxy_view.view_class == MockTestView


@override_settings(NEXT_PUBLIC_MOCK_FLAG=False)
def test_view_class_with_mock_flag_off(mock_enabled_proxy_view):
    assert mock_enabled_proxy_view.view_class == RealTestView


def test_view_class_with_changing_mock_flag(settings, mock_enabled_proxy_view):
    settings.NEXT_PUBLIC_MOCK_FLAG = True
    assert mock_enabled_proxy_view.view_class == MockTestView

    delattr(settings, "NEXT_PUBLIC_MOCK_FLAG")
    assert mock_enabled_proxy_view.view_class == RealTestView

    settings.NEXT_PUBLIC_MOCK_FLAG = False
    assert mock_enabled_proxy_view.view_class == RealTestView


@pytest.mark.parametrize("next_public_mock_flag", [False, True])
@pytest.mark.parametrize("initkwargs", [{}, {"http_method_names": ["get", "post"]}])
def test_valid_view_initkwargs(settings, next_public_mock_flag: bool, initkwargs: dict):
    settings.NEXT_PUBLIC_MOCK_FLAG = next_public_mock_flag
    assert (
        MockEnabledProxyView(
            real_view_class=RealTestView, mock_view_class=MockTestView, **initkwargs
        ).view_initkwargs
        == initkwargs
    )


@pytest.mark.parametrize("next_public_mock_flag", [False, True])
@pytest.mark.parametrize(
    "initkwargs",
    [
        {"inexistent_attribute_name": "test"},
        {"get": "test"},  # Key from View.http_method_names shouldn't be accepted
        {"options": "test"},  # Key from View.http_method_names shouldn't be accepted
    ],
)
def test_invalid_view_initkwargs(
    settings, next_public_mock_flag: bool, initkwargs: dict
):
    settings.NEXT_PUBLIC_MOCK_FLAG = next_public_mock_flag
    with pytest.raises(TypeError):
        MockEnabledProxyView(
            real_view_class=RealTestView, mock_view_class=MockTestView, **initkwargs
        )


@pytest.mark.parametrize("next_public_mock_flag", [False, True])
def test_view_callability(
    settings, mock_enabled_proxy_view, next_public_mock_flag: bool
):
    settings.NEXT_PUBLIC_MOCK_FLAG = next_public_mock_flag
    assert callable(mock_enabled_proxy_view)


def test_view_call_with_changing_mock_flag(settings, mock_enabled_proxy_view):
    # Test classes' called methods should return ViewClassInfo, see BaseTestView
    settings.NEXT_PUBLIC_MOCK_FLAG = True
    mock_get_request = MockRequest(method="get")
    call_info: ViewCallInfo = mock_enabled_proxy_view(mock_get_request, 1, 2, test=3)
    assert call_info.class_name == "MockTestView"
    assert call_info.called_method_name == "get"
    assert call_info.request == mock_get_request
    assert call_info.args == (1, 2)
    assert call_info.kwargs == {"test": 3}

    delattr(settings, "NEXT_PUBLIC_MOCK_FLAG")
    mock_post_request = MockRequest(method="post")
    call_info: ViewCallInfo = mock_enabled_proxy_view(mock_post_request, 3, 4, a=5, b=6)
    assert call_info.class_name == "RealTestView"
    assert call_info.called_method_name == "post"
    assert call_info.request == mock_post_request
    assert call_info.args == (3, 4)
    assert call_info.kwargs == {"a": 5, "b": 6}

    settings.NEXT_PUBLIC_MOCK_FLAG = True
    call_info: ViewCallInfo = mock_enabled_proxy_view(mock_get_request, "a", 1, c=2)
    assert call_info.class_name == "MockTestView"
    assert call_info.called_method_name == "get"
    assert call_info.request == mock_get_request
    assert call_info.args == ("a", 1)
    assert call_info.kwargs == {"c": 2}

    settings.NEXT_PUBLIC_MOCK_FLAG = False
    call_info: ViewCallInfo = mock_enabled_proxy_view(mock_post_request, test=1, more=2)
    assert call_info.class_name == "RealTestView"
    assert call_info.called_method_name == "post"
    assert call_info.request == mock_post_request
    assert call_info.args == tuple()
    assert call_info.kwargs == {"test": 1, "more": 2}

    # Patch method is not implemented in the underlying test views, so it's not allowed
    mock_patch_request = MockRequest(method="patch")
    call_info: ViewCallInfo = mock_enabled_proxy_view(mock_patch_request, 1, "a", b=5)
    assert call_info.class_name == "RealTestView"
    assert call_info.called_method_name == "http_method_not_allowed"
    assert call_info.request == mock_patch_request
    assert call_info.args == (1, "a")
    assert call_info.kwargs == {"b": 5}


@pytest.mark.parametrize(
    "next_public_mock_flag,expected_view_class_name",
    [
        (False, "RealTestView"),
        (True, "MockTestView"),
    ],
)
@pytest.mark.parametrize(
    "initkwargs,mock_request,expected_called_method",
    [
        ({}, MockRequest(method="get"), "get"),  # View's default methods contain get
        ({}, MockRequest(method="post"), "post"),  # View's default methods contain post
        (
            {},
            MockRequest(method="patch"),
            "http_method_not_allowed",  # patch method is not implemented
        ),
        (
            {},
            MockRequest(method="unknown"),
            "http_method_not_allowed",  # unknown method is not implemented
        ),
        (
            {"http_method_names": ["post"]},
            MockRequest(method="get"),
            "http_method_not_allowed",
        ),
        ({"http_method_names": ["post"]}, MockRequest(method="post"), "post"),
        (
            {"http_method_names": ["post"]},
            MockRequest(method="patch"),
            "http_method_not_allowed",
        ),
        ({"http_method_names": ["get", "patch"]}, MockRequest(method="get"), "get"),
        (
            {"http_method_names": ["get", "patch"]},
            MockRequest(method="post"),
            "http_method_not_allowed",
        ),
        (
            {"http_method_names": ["get", "patch"]},
            MockRequest(method="patch"),
            "http_method_not_allowed",  # patch method is not implemented
        ),
        ({"http_method_names": ["get", "post"]}, MockRequest(method="get"), "get"),
        ({"http_method_names": ["get", "post"]}, MockRequest(method="post"), "post"),
        (
            {"http_method_names": ["get", "post"]},
            MockRequest(method="patch"),
            "http_method_not_allowed",
        ),
    ],
)
@pytest.mark.parametrize("call_args", [(), ("test", 1, "more_test")])
@pytest.mark.parametrize(
    "call_kwargs",
    [
        {},
        {"a": 1, "b": 3.14, "c": "test"},
        {"outer_key": {"nested_key": "nested_value"}, "outer_key_2": 2},
    ],
)
def test_view_call(
    settings,
    next_public_mock_flag: bool,
    initkwargs: dict,
    mock_request: MockRequest,
    expected_view_class_name: str,
    expected_called_method: str,
    call_args: tuple,
    call_kwargs: dict,
):
    # This test relys on Django's View class,
    # see View's as_view, dispatch and http_method_names:
    # https://github.com/django/django/blob/stable/3.2.x/django/views/generic/base.py
    settings.NEXT_PUBLIC_MOCK_FLAG = next_public_mock_flag
    view = MockEnabledProxyView(
        real_view_class=RealTestView, mock_view_class=MockTestView, **initkwargs
    )
    # Test classes' called methods should return ViewClassInfo, see BaseTestView
    call_info: ViewCallInfo = view(mock_request, *call_args, **call_kwargs)
    assert call_info.class_name == expected_view_class_name
    assert call_info.called_method_name == expected_called_method
    assert call_info.request == mock_request
    assert call_info.args == call_args
    assert call_info.kwargs == call_kwargs
