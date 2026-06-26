"""Security header middleware for Kesäseteli backend HTML and API responses."""

# Keep in sync with frontend/kesaseteli/shared/src/config/csp.js PERMISSIONS_POLICY.
PERMISSIONS_POLICY = "camera=(), microphone=(), geolocation=(), payment=(), usb=()"


class PermissionsPolicyMiddleware:
    """Attach a restrictive Permissions-Policy header to non-exempt responses."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        # Probe views use @csp_exempt().
        # Skip Permissions-Policy on those responses too.
        if getattr(response, "_csp_exempt", False):
            return response
        response["Permissions-Policy"] = PERMISSIONS_POLICY
        return response
