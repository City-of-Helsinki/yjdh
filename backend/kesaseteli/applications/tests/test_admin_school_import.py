from unittest.mock import Mock

import pytest
from django.contrib.admin.sites import AdminSite
from django.contrib.messages.storage.fallback import FallbackStorage
from django.test import RequestFactory
from django.urls import reverse

from applications.admin import SchoolAdmin
from applications.models import School
from shared.common.tests.factories import UserFactory


@pytest.fixture
def school_admin():
    return SchoolAdmin(School, AdminSite())


@pytest.fixture
def admin_user():
    user = UserFactory(is_staff=True, is_superuser=True)
    return user


@pytest.mark.django_db
def test_import_school_view_get(school_admin, admin_user):
    factory = RequestFactory()
    request = factory.get(reverse("admin:applications_school_import"))
    request.user = admin_user

    response = school_admin.import_schools_view(request)

    assert response.status_code == 200


@pytest.mark.django_db
def test_import_school_view_post_text(school_admin, admin_user):
    factory = RequestFactory()
    data = {"school_names": "School A\nSchool B"}
    request = factory.post(reverse("admin:applications_school_import"), data)
    request.user = admin_user

    # Fix message storage
    request.session = Mock()
    request._messages = FallbackStorage(request)

    response = school_admin.import_schools_view(request)

    assert response.status_code == 302
    assert School.objects.filter(name="School A").exists()
    assert School.objects.filter(name="School B").exists()


@pytest.mark.django_db
def test_import_school_view_permission(school_admin):
    user = UserFactory(is_staff=False, is_superuser=False)
    factory = RequestFactory()
    request = factory.get(reverse("admin:applications_school_import"))
    request.user = user

    response = school_admin.import_schools_view(request)

    assert response.status_code == 302  # Redirects to admin:index or login
    assert response.url == reverse("admin:index")
