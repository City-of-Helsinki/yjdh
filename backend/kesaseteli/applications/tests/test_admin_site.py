import pytest
from django.contrib.auth.models import AnonymousUser
from django.contrib.sessions.middleware import SessionMiddleware
from django.core.exceptions import PermissionDenied
from django.test import override_settings, RequestFactory

from kesaseteli.admin_site import KesaseteliAdminSite


@pytest.fixture
def admin_site():
    return KesaseteliAdminSite(name="kesaseteli_admin")


@pytest.fixture
def request_factory():
    return RequestFactory()


def setup_request(request):
    """Add session and user to request to mimic middleware."""
    middleware = SessionMiddleware(lambda x: None)
    middleware.process_request(request)
    request.session.save()
    request.user = AnonymousUser()
    return request


@override_settings(PASSWORD_LOGIN_DISABLED=False)
def test_each_context_contains_setting(admin_site, request_factory):
    request = request_factory.get("/admin/")
    setup_request(request)
    context = admin_site.each_context(request)
    assert "password_login_disabled" in context
    assert context["password_login_disabled"] is False


@override_settings(PASSWORD_LOGIN_DISABLED=True)
def test_each_context_setting_true_when_configured(admin_site, request_factory):
    request = request_factory.get("/admin/")
    setup_request(request)
    context = admin_site.each_context(request)
    assert context["password_login_disabled"] is True


def test_login_view_accessible_by_default(admin_site, request_factory):
    request = request_factory.get("/admin/login/")
    setup_request(request)
    response = admin_site.login(request)
    assert response.status_code == 200


@override_settings(PASSWORD_LOGIN_DISABLED=True)
def test_login_view_get_accessible_when_disabled(admin_site, request_factory):
    request = request_factory.get("/admin/login/")
    setup_request(request)
    response = admin_site.login(request)
    assert response.status_code == 200


@override_settings(PASSWORD_LOGIN_DISABLED=True)
def test_login_view_post_raises_permission_denied_when_disabled(
    admin_site, request_factory
):
    request = request_factory.post(
        "/admin/login/", data={"username": "foo", "password": "bar"}
    )
    setup_request(request)
    with pytest.raises(PermissionDenied):
        admin_site.login(request)
