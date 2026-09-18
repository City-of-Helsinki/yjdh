import os
from unittest.mock import patch

import pytest


class TestSentryConfiguration:
    """Tests for Sentry configuration and traces sampler."""

    def test_sentry_traces_sampler_with_parent_sampled_true(self):
        """Test that parent sampling decision is respected when True."""
        from helsinkibenefit.settings import sentry_traces_sampler

        sampling_context = {"parent_sampled": True}
        result = sentry_traces_sampler(sampling_context)

        assert str(result) == str(1.0)

    def test_sentry_traces_sampler_with_parent_sampled_false(self):
        """Test that parent sampling decision is respected when False."""
        from helsinkibenefit.settings import sentry_traces_sampler

        sampling_context = {"parent_sampled": False}
        result = sentry_traces_sampler(sampling_context)

        assert str(result) == str(0.0)

    @patch(
        "helsinkibenefit.settings.SENTRY_TRACES_IGNORE_PATHS",
        ["/healthz", "/readiness"],
    )
    def test_sentry_traces_sampler_ignores_health_check_paths(self):
        """Test that health check endpoints return 0 sample rate."""
        from helsinkibenefit.settings import sentry_traces_sampler

        sampling_context = {
            "parent_sampled": None,
            "wsgi_environ": {"PATH_INFO": "/healthz/"},
        }
        result = sentry_traces_sampler(sampling_context)

        assert result == 0

    @patch("helsinkibenefit.settings.SENTRY_TRACES_SAMPLE_RATE", 0.5)
    def test_sentry_traces_sampler_uses_configured_rate(self):
        """Test that configured sample rate is used for normal requests."""
        from helsinkibenefit.settings import sentry_traces_sampler

        sampling_context = {
            "parent_sampled": None,
            "wsgi_environ": {"PATH_INFO": "/api/v1/applications/"},
        }
        result = sentry_traces_sampler(sampling_context)

        assert str(result) == str(0.5)

    @patch("helsinkibenefit.settings.SENTRY_TRACES_SAMPLE_RATE", None)
    def test_sentry_traces_sampler_defaults_to_zero(self):
        """Test that sample rate defaults to 0 when not configured."""
        from helsinkibenefit.settings import sentry_traces_sampler

        sampling_context = {
            "parent_sampled": None,
            "wsgi_environ": {"PATH_INFO": "/api/v1/applications/"},
        }
        result = sentry_traces_sampler(sampling_context)

        assert result == 0

    @patch.dict(
        os.environ, {"SENTRY_DSN": "https://example@sentry.io/123456"}, clear=False
    )
    @patch("sentry_sdk.init")
    def test_sentry_init_called_with_dsn(self, mock_sentry_init):
        """Test that Sentry is initialized when DSN is configured."""
        import sys

        # Remove the module from cache to force reimport
        if "helsinkibenefit.settings" in sys.modules:
            del sys.modules["helsinkibenefit.settings"]

        # Import will trigger the module-level sentry_sdk.init call
        import helsinkibenefit.settings  # noqa: F401

        # Verify sentry_sdk.init was called
        assert mock_sentry_init.called
        # Optionally verify it was called with correct DSN
        assert any(
            "https://example@sentry.io/123456" in str(call_args)
            for call_args in mock_sentry_init.call_args_list
        )

    @patch.dict(os.environ, {"SENTRY_DSN": ""}, clear=False)
    @patch("sentry_sdk.init")
    def test_sentry_init_not_called_without_dsn(self, mock_sentry_init):
        """Test that Sentry is not initialized when DSN is empty."""
        import sys

        # Remove the module from cache to force reimport
        if "helsinkibenefit.settings" in sys.modules:
            del sys.modules["helsinkibenefit.settings"]

        # Reset the mock to clear any previous calls
        mock_sentry_init.reset_mock()

        # Import with empty DSN should not call sentry_sdk.init
        import helsinkibenefit.settings  # noqa: F401

        assert not mock_sentry_init.called


class TestHelsinkiProfileAudience:
    """Tests for deriving the Helsinki Profile API token audience."""

    @pytest.mark.parametrize(
        "api_url,expected",
        [
            ("https://profile-api.test.hel.ninja/graphql/", "profile-api-test"),
            ("https://profile-api.stage.hel.ninja/graphql/", "profile-api-stage"),
            ("https://api.hel.fi/profiili/graphql/", "profile-api"),
        ],
    )
    def test_audience_is_derived_from_profile_api_url(self, api_url, expected):
        from helsinkibenefit.settings import helsinki_profile_audience

        assert helsinki_profile_audience(api_url) == expected
