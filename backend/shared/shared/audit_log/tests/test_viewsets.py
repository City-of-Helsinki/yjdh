import pytest
from django.contrib.auth import get_user_model

from shared.audit_log.viewsets import AuditLoggingModelViewSet

User = get_user_model()


class DummyAuditLoggingModelViewSet(AuditLoggingModelViewSet):
    queryset = User.objects.all()


@pytest.mark.django_db
def test_get_target_object_returns_user_with_uuid_pk_string(user):
    viewset = DummyAuditLoggingModelViewSet()
    viewset.kwargs = {"pk": str(user.pk)}

    assert viewset._get_target_object() == user


@pytest.mark.django_db
def test_get_target_object_returns_none_for_invalid_uuid_pk_string():
    viewset = DummyAuditLoggingModelViewSet()
    viewset.kwargs = {"pk": "not-a-uuid"}

    assert viewset._get_target_object() is None
