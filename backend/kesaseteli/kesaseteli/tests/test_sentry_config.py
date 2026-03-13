"""
Tests for Sentry traces sampler.

The sampler is a pure function; tests use dicts as SamplingContext
and require no Django setup.
"""

import pytest

from kesaseteli.sentry_config import sentry_traces_sampler


@pytest.mark.parametrize(
    "context,ignore_paths,sample_rate,expected",
    [
        # Path in ignore list
        (
            {"wsgi_environ": {"PATH_INFO": "/healthz"}},
            ["/healthz"],
            0.5,
            0,
        ),
        # Path with trailing slash
        (
            {"wsgi_environ": {"PATH_INFO": "/readiness/"}},
            ["/readiness"],
            0.5,
            0,
        ),
        # Parent sampled True
        (
            {"parent_sampled": True},
            [],
            0.1,
            1.0,
        ),
        # Parent sampled False
        (
            {"parent_sampled": False},
            [],
            0.5,
            0.0,
        ),
        # No path, no parent
        (
            {},
            [],
            0.1,
            0.1,
        ),
        # No path, no parent, sample_rate None
        (
            {},
            [],
            None,
            0,
        ),
        # Path not ignored
        (
            {"wsgi_environ": {"PATH_INFO": "/api/v1/"}},
            ["/healthz"],
            0.2,
            0.2,
        ),
        # Path ignored before parent (path check wins)
        (
            {"wsgi_environ": {"PATH_INFO": "/healthz"}, "parent_sampled": True},
            ["/healthz"],
            0.1,
            0,
        ),
        # Empty wsgi_environ
        (
            {"wsgi_environ": {}},
            ["/healthz"],
            0.3,
            0.3,
        ),
        # Ignore path without leading slash (config: "healthz" matches "/healthz")
        (
            {"wsgi_environ": {"PATH_INFO": "/healthz"}},
            ["healthz"],
            0.5,
            0,
        ),
        # Ignore path with trailing slash (config: "/readiness/" matches "/readiness")
        (
            {"wsgi_environ": {"PATH_INFO": "/readiness"}},
            ["/readiness/"],
            0.5,
            0,
        ),
    ],
)
def test_sentry_traces_sampler(
    context: dict,
    ignore_paths: list[str],
    sample_rate: float | None,
    expected: float,
) -> None:
    """
    Test that sampler returns correct probability for given context and config.
    """
    result = sentry_traces_sampler(
        context,
        ignore_paths=ignore_paths,
        sample_rate=sample_rate,
    )
    assert result == expected


@pytest.mark.parametrize(
    "path_info,ignore_paths_config",
    [
        # Quota protection: config "healthz" (no leading slash) must match PATH_INFO "/healthz".
        # Without normalization this would trace healthz every minute and burn quota.
        ("/healthz", ["healthz"]),
        ("/healthz/", ["healthz"]),
        ("/healthz", ["/healthz/"]),
    ],
)
def test_normalization_contract_quota_protection(
    path_info: str,
    ignore_paths_config: list[str],
) -> None:
    """
    Enforce normalization contract: any config format must exclude health checks.

    Health checks run every minute. Misconfiguration (e.g. "healthz" vs "/healthz")
    would fail to match and burn through Sentry quota rapidly.
    """
    context = {"wsgi_environ": {"PATH_INFO": path_info}}
    result = sentry_traces_sampler(
        context,
        ignore_paths=ignore_paths_config,
        sample_rate=0.5,
    )
    assert result == 0


def test_sentry_traces_sampler_requires_ignore_paths() -> None:
    """Missing ignore_paths raises TypeError."""
    with pytest.raises(TypeError, match="ignore_paths"):
        sentry_traces_sampler({}, sample_rate=0.1)


def test_sentry_traces_sampler_requires_sample_rate() -> None:
    """Missing sample_rate raises TypeError."""
    with pytest.raises(TypeError, match="sample_rate"):
        sentry_traces_sampler({}, ignore_paths=[])
