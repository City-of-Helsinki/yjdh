"""Shared drf-spectacular hooks for Kesäseteli OpenAPI generation."""


def preprocessing_filter_public_api_paths(endpoints: list) -> list:
    """Limit schema generation to the public REST API and handler Excel exports.

    Args:
        endpoints: Candidate endpoints from URL routing.

    Returns:
        Endpoints whose paths start with ``/v1/`` or ``/excel-download/``.
    """
    allowed_prefixes = ("/v1/", "/excel-download/")
    return [
        endpoint for endpoint in endpoints if endpoint[0].startswith(allowed_prefixes)
    ]
