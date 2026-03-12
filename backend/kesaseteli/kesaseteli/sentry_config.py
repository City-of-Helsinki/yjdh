"""
Sentry configuration for Kesäseteli.

Contains pure functions for Sentry SDK setup, suitable for testing.
"""

from sentry_sdk.types import SamplingContext


def sentry_traces_sampler(
    sampling_context: SamplingContext,
    *,
    ignore_paths: list[str],
    sample_rate: float,
) -> float:
    """
    Decide whether to sample a transaction for Sentry tracing.

    Called once per transaction (root span) by Sentry.
    Return value is a probability in [0, 1]
    and Sentry samples the transaction when rand < rate.
    0 means drop, 1 means always send,
    and values in between mean sample the transaction at that rate.
    E.g. return value 0.1 means sample the transaction 10% of the time.

    The function has two short-circuits that are checked in order:
    1. Paths in ignore_paths (e.g. /healthz, /readiness) are
       always dropped, even when part of a distributed trace.
    2. If the parent transaction is sampled, return it so distributed
       traces stay consistent.
    Otherwise return sample_rate (or 0 if not set).

    Both the incoming path (from PATH_INFO) and ignore_paths are normalized
    by stripping leading/trailing slashes, so "/healthz", "healthz", and
    "/healthz/" all match. This protects against misconfiguration: e.g.
    config "healthz" without leading slash would otherwise fail to match
    PATH_INFO "/healthz" and burn through Sentry quota
    (assuming health checks are called every minute).

    For more information, see:
    https://docs.sentry.io/platforms/python/tracing/configure-sampling/

    :param sampling_context: Sentry-provided context (path, parent_sampled, etc.).
    :param ignore_paths: Paths to exclude from tracing (e.g. health checks).
    :param sample_rate: Default sampling probability when no other rule applies.
    :return: Sampling probability in [0, 1]
    """
    # Explicitly ignored paths
    #
    # Normalize both the path and the ignore_paths by stripping
    # leading/trailing slashes
    # so "/healthz", "healthz", and "/healthz/" all match.
    path: str = sampling_context.get("wsgi_environ", {}).get("PATH_INFO", "").strip("/")
    ignore_normalized: set[str] = {p.strip("/") for p in ignore_paths}
    if path in ignore_normalized:
        return 0.0
    # Respect the parent transaction's sampling decision for distributed traces.
    parent_sampled: bool | None = sampling_context.get("parent_sampled")
    if parent_sampled is not None:
        return float(parent_sampled)
    # Use the configured sample rate (or 0 if not set).
    return float(sample_rate or 0)
