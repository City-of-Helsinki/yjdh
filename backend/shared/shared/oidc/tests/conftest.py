import pytest
from django.contrib.sessions.middleware import SessionMiddleware
from django.http import HttpResponse
from django.test import RequestFactory

from shared.common.tests.conftest import *  # noqa


@pytest.fixture
def mock_request():
    state = "test"
    code = "test"
    factory = RequestFactory()

    return factory.get("/", {"code": code, "state": state})


@pytest.fixture
def get_response(mock_request):
    return HttpResponse()


@pytest.fixture()
def session_request():
    factory = RequestFactory()
    request = factory.get("/")
    middleware = SessionMiddleware(get_response)
    middleware.process_request(request)
    request.session.save()

    return request
