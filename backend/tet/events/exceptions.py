from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler


class LinkedEventsException(APIException):
    status_code = 503
    default_detail = 'Service Linked Events temporarily unavailable, try again later.'
    default_code = 'service_unavailable'
    detail = "Error from Linked Events"

    def __init__(self, code, response_data=None):
        self.status_code = code
        self.response_data = response_data


def base_exception_handler(exc, context):
    # Call DRF's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)

    if isinstance(exc, LinkedEventsException):
        response.data = exc.response_data

    return response

