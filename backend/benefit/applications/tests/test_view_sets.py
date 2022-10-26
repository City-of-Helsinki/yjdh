import pytest
from django.contrib.auth.models import AnonymousUser
from django.db.models import QuerySet

from applications.api.v1.views import ApplicantApplicationViewSet
from applications.models import Application


@pytest.mark.parametrize("next_public_mock_flag", [False, True])
def test_applicant_application_view_set_get_queryset_with_anonymous_user(
    settings,
    next_public_mock_flag: bool,
    anonymous_client,
    application,
    association_application,
    decided_application,
    handling_application,
    received_application,
    anonymous_handling_application,
    anonymous_application,
):
    settings.NEXT_PUBLIC_MOCK_FLAG = next_public_mock_flag

    class MockRequestWithAnonymousUser:
        user = AnonymousUser()

    assert len(Application.objects.all()) == 7
    view_set: ApplicantApplicationViewSet = ApplicantApplicationViewSet()
    setattr(view_set, "request", MockRequestWithAnonymousUser())
    queryset: QuerySet[Application] = view_set.get_queryset()

    if next_public_mock_flag:
        assert sorted(queryset.values_list("pk", flat=True)) == sorted(
            Application.objects.all().values_list("pk", flat=True)
        )
    else:
        assert not queryset.exists()
