import datetime

import pytest
from django.utils import timezone

from oidc.jobs.hourly.clear_user_sessions import Job as ClearUserSessionsJob
from oidc.models import EAuthorizationProfile


@pytest.mark.django_db
def test_clear_sessions_job(eauthorization_profile):
    eauthorization_profile.refresh_token_expires = timezone.now() - datetime.timedelta(
        hours=3
    )
    eauthorization_profile.save()

    eauthorization_profile.oidc_profile.refresh_token_expires = (
        timezone.now() - datetime.timedelta(hours=3)
    )
    eauthorization_profile.oidc_profile.save()

    job = ClearUserSessionsJob()
    job.execute()

    assert EAuthorizationProfile.objects.count() == 0
