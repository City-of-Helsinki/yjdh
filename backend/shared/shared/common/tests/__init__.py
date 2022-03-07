from django.test import RequestFactory


def get_default_test_host():
    return RequestFactory().request().get_host()
