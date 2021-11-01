import pytest
from django.contrib.sessions.middleware import SessionMiddleware
from django.test import RequestFactory

from shared.common.tests.conftest import *  # noqa


@pytest.fixture()
def session_request():
    factory = RequestFactory()
    request = factory.get("/")
    middleware = SessionMiddleware()
    middleware.process_request(request)
    request.session.save()

    return request
