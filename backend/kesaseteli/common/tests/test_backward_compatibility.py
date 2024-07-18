from unittest import mock

import pytest

from common.backward_compatibility import (
    convert_to_django_4_2_csrf_trusted_origin,
    convert_to_django_4_2_csrf_trusted_origins,
)


@pytest.mark.parametrize("origin", ["", None])
def test_convert_to_django_4_2_csrf_trusted_origin_falsy(origin):
    """
    Test convert_to_django_4_2_csrf_trusted_origin with falsy inputs
    """
    assert convert_to_django_4_2_csrf_trusted_origin(origin) == []


@pytest.mark.parametrize(
    "origin,expected_output",
    [
        ("test.dev.hel.ninja", ["https://test.dev.hel.ninja"]),
        (".dev.hel.ninja", ["https://*.dev.hel.ninja"]),
        (".hel.fi", ["https://*.hel.fi"]),
        (".hel.ninja", ["https://*.hel.ninja"]),
        (".arodevtest.hel.fi", ["https://*.arodevtest.hel.fi"]),
    ],
)
def test_convert_to_django_4_2_csrf_trusted_origin_changed(origin, expected_output):
    """
    Test convert_to_django_4_2_csrf_trusted_origin with Django 4.2 incompatible origins
    i.e. those that need to be changed.
    """
    assert expected_output != [origin]
    assert convert_to_django_4_2_csrf_trusted_origin(origin) == expected_output


@pytest.mark.parametrize(
    "origin",
    [
        "https://*.hel.ninja",
        "https://test.dev.hel.ninja",
        "scheme_already_present://a.b.com",
    ],
)
def test_convert_to_django_4_2_csrf_trusted_origin_already_compatible(origin):
    """
    Test convert_to_django_4_2_csrf_trusted_origin with Django 4.2 compatible origins
    i.e. those that do not need to be changed.
    """
    assert convert_to_django_4_2_csrf_trusted_origin(origin) == [origin]


@pytest.mark.parametrize(
    "origins,expected_output",
    [
        ([], []),
        (["test.dev.hel.ninja"], ["https://test.dev.hel.ninja"]),
        ([".dev.hel.ninja"], ["https://*.dev.hel.ninja"]),
        (
            [".hel.fi", ".hel.ninja", "test.dev.hel.ninja"],
            ["https://*.hel.fi", "https://*.hel.ninja", "https://test.dev.hel.ninja"],
        ),
        ([".arodevtest.hel.fi"], ["https://*.arodevtest.hel.fi"]),
        (
            ["https://*.hel.fi", "https://*.hel.ninja"],
            ["https://*.hel.fi", "https://*.hel.ninja"],
        ),
        (
            [".hel.fi", "https://*.hel.ninja"],
            ["https://*.hel.fi", "https://*.hel.ninja"],
        ),
    ],
)
def test_convert_to_django_4_2_csrf_trusted_origins(origins, expected_output):
    """
    Test convert_to_django_4_2_csrf_trusted_origins with varying origins
    """
    assert convert_to_django_4_2_csrf_trusted_origins(origins) == expected_output


@pytest.mark.parametrize(
    "origins,schemes,expected_output",
    [
        ([], (), []),
        ([], ("arbitrary_scheme://", "https://"), []),
        ([".hel.fi", "test.dev.hel.ninja"], (), []),
        ([".hel.fi", "https://*.hel.ninja"], (), ["https://*.hel.ninja"]),
        (
            [".hel.fi", "scheme_already_present://*.hel.ninja"],
            ("added_scheme://",),
            ["added_scheme://*.hel.fi", "scheme_already_present://*.hel.ninja"],
        ),
        (
            [
                ".hel.fi",
                "scheme_already_present://*.hel.ninja",
                "test.makasiini.hel.ninja",
            ],
            ("a://", "b://", "c://"),
            [
                "a://*.hel.fi",
                "b://*.hel.fi",
                "c://*.hel.fi",
                "scheme_already_present://*.hel.ninja",
                "a://test.makasiini.hel.ninja",
                "b://test.makasiini.hel.ninja",
                "c://test.makasiini.hel.ninja",
            ],
        ),
    ],
)
def test_convert_to_django_4_2_csrf_trusted_origins_with_schemes(
    origins, schemes, expected_output
):
    """
    Test convert_to_django_4_2_csrf_trusted_origins with varying origins & schemes
    """
    assert (
        convert_to_django_4_2_csrf_trusted_origins(origins, schemes) == expected_output
    )


def test_convert_to_django_4_2_csrf_trusted_origins_call():
    """
    Test that convert_to_django_4_2_csrf_trusted_origins calls
    convert_to_django_4_2_csrf_trusted_origin
    """
    with mock.patch(
        "common.backward_compatibility.convert_to_django_4_2_csrf_trusted_origin"
    ) as mocked_convert_to_django_4_2_csrf_trusted_origin:
        convert_to_django_4_2_csrf_trusted_origins([".hel.fi"])
        mocked_convert_to_django_4_2_csrf_trusted_origin.assert_called()
