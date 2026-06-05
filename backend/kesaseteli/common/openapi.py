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


def replace_underscores_with_spaces(result, generator, **kwargs):
    """Post-processing hook to normalize operation IDs and summaries for OpenAPI
    documentation.

    This hook modifies the generated schema in two ways:
    1. Strips the path/resource name prefix from the operation ID (e.g., stripping
        `youthapplications_` from `youthapplications_status_retrieve` to yield
        `status_retrieve`). This removes the redundant view/resource prefixes
        from generated client method names.
    2. Populates the `summary` field (which ReDoc uses for operation headers) by
       replacing underscores with spaces (e.g., `status retrieve`). ReDoc does not
       automatically wrap snake_case words, causing long operation names to break the
       sidebar layout; using space-delimited text resolves this.

    Args:
        result: The generated OpenAPI schema dictionary.
        generator: The SchemaGenerator instance.
        **kwargs: Additional parameters passed by drf-spectacular.

    Returns:
        The mutated schema dictionary.
    """
    for path, methods in result.get("paths", {}).items():
        # Determine resource/view name prefix to strip from path
        clean_path = path.lstrip("/")
        if clean_path.startswith("v1/"):
            clean_path = clean_path[3:]

        segments = clean_path.split("/")
        prefix = ""
        if segments and segments[0]:
            prefix = f"{segments[0].replace('-', '_')}_"

        for _method, operation in methods.items():
            if "operationId" in operation:
                op_id = operation["operationId"]
                if prefix and op_id.startswith(prefix):
                    op_id = op_id[len(prefix) :]
                    operation["operationId"] = op_id

                # If a summary isn't explicitly defined, Redoc falls back to
                # operationId. Giving it a clean summary with spaces fixes
                # the layout wrap.
                if "summary" not in operation:
                    operation["summary"] = op_id.replace("_", " ")
    return result
