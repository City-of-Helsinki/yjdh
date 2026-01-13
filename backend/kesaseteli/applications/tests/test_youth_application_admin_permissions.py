import pytest
from django.contrib.admin.sites import AdminSite

from applications.admin import YouthApplicationAdmin
from applications.models import YouthApplication
from common.tests.factories import YouthApplicationFactory


@pytest.fixture
def youth_application_admin():
    return YouthApplicationAdmin(YouthApplication, AdminSite())


@pytest.mark.django_db
def test_has_add_permission(youth_application_admin):
    assert youth_application_admin.has_add_permission(None) is False


@pytest.mark.django_db
def test_get_readonly_fields(youth_application_admin):
    app = YouthApplicationFactory.build()
    readonly_fields = youth_application_admin.get_readonly_fields(None, obj=app)

    # Check that contact fields are NOT readonly
    editable_fields = [
        "first_name",
        "last_name",
        "email",
        "phone_number",
        "postcode",
        "school",
        "is_unlisted_school",
        "language",
    ]
    for field in editable_fields:
        assert field not in readonly_fields

    # Check that other fields are readonly
    # Just checking a few key ones to verify the logic
    assert "social_security_number" in readonly_fields
    assert "encrypted_social_security_number" in readonly_fields
    assert "status" in readonly_fields
    assert "created_at" in readonly_fields


@pytest.mark.django_db
def test_get_readonly_fields_add_view(youth_application_admin):
    # When obj is None (add view), readonly fields should be default (empty or whatever is defined in super)
    # But since we disabled add permission, this is less critical, but good to ensure logic doesn't crash
    readonly_fields = youth_application_admin.get_readonly_fields(None, obj=None)
    # Based on our implementation, it returns super().get_readonly_fields(request, obj) which is likely empty list or configured readonly_fields
    # We didn't configure readonly_fields in the class, so it should be empty list usually.
    assert isinstance(readonly_fields, (list, tuple))
