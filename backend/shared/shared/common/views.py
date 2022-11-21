from typing import Type

from django.conf import settings
from django.views import View


class MockEnabledProxyView:
    """
    A view that changes on-the-fly between the real and mocked view based on the current
    value of NEXT_PUBLIC_MOCK_FLAG.

    An instance of this class tries to act like
    mock_view_class.as_view(**initkwargs) when NEXT_PUBLIC_MOCK_FLAG setting is set,
    otherwise as real_view_class.as_view(**initkwargs) where mock_view_class and
    real_view_class are the classes passed to the __init__ function.

    For reference see django.views.generic.base.View.as_view:
    https://github.com/django/django/blob/stable/3.2.x/django/views/generic/base.py#L49

    The double underscore prefixes for variables/properties are used to invoke name
    mangling to avoid name clashes with the enclosed View classes, see PEP8:
     - https://pep8.org/#method-names-and-instance-variables
    """

    def __init__(
        self, real_view_class: Type[View], mock_view_class: Type[View], **initkwargs
    ):
        """
        Initialize the real view to real_view_class.as_view(**initkwargs) and
        mock view to mock_view_class.as_view(**initkwargs).

        :param real_view_class: Type of View class to use when mocking is turned off
        :param mock_view_class: Type of View class to use when mocking is turned on
        :param initkwargs: The keyword arguments passed to real_view_class.as_view and
                           mock_view_class.as_view functions
        """
        self.__real_view = real_view_class.as_view(**initkwargs)
        self.__mock_view = mock_view_class.as_view(**initkwargs)

    @property
    def __view(self):
        """
        The underlying view initialized using <ViewClass>.as_view(**initkwargs) based
        on the current value of NEXT_PUBLIC_MOCK_FLAG setting.

        :return: mock_view_class.as_view(**initkwargs) if NEXT_PUBLIC_MOCK_FLAG setting
                 exists and is truthy, otherwise real_view_class.as_view(**initkwargs)
        """
        is_mocked = getattr(settings, "NEXT_PUBLIC_MOCK_FLAG", False)
        return self.__mock_view if is_mocked else self.__real_view

    def __getattr__(self, name):
        """
        Read all attributes not found in this instance from the underlying view.

        This is needed because django.views.generic.base.View.as_view returns a function
        which has attributes written into it, e.g. view_class and view_initkwargs, and
        they need to be accessible directly through this instance.
        """
        return getattr(self.__view, name)

    def __call__(self, *args, **kwargs):
        """
        Redirect all calls made to this instance to the underlying view.

        This is needed because django.views.generic.base.View.as_view returns a function
        which can be called like function(request, *args, **kwargs) and calling it with
        the passed parameters needs to be doable directly through this instance.
        """
        return self.__view.__call__(*args, **kwargs)
