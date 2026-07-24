import datetime

import pytest
from dateutil.relativedelta import relativedelta
from freezegun import freeze_time

from applications.jobs.daily import (
    clean_old_attachments,
    clean_old_employer_applications,
)
from applications.models import Attachment, EmployerApplication
from kesaseteli.jobs.monthly import cleanup_applications as cleanup_applications_job


@pytest.mark.django_db
def test_clean_old_applications_job(application):
    with freeze_time(
        datetime.date.today() + relativedelta(years=5) - relativedelta(days=1)
    ):
        clean_job = clean_old_employer_applications.Job()
        clean_job.execute()

    assert EmployerApplication.objects.count() == 1

    with freeze_time(datetime.date.today() + relativedelta(years=5, days=1)):
        clean_job = clean_old_employer_applications.Job()
        clean_job.execute()

    assert EmployerApplication.objects.count() == 0


@pytest.mark.django_db
def test_clean_old_attachments_job(employment_contract_attachment):
    with freeze_time(
        datetime.date.today() + relativedelta(years=1) - relativedelta(days=1)
    ):
        clean_job = clean_old_attachments.Job()
        clean_job.execute()

    assert Attachment.objects.count() == 1

    with freeze_time(datetime.date.today() + relativedelta(years=1, days=1)):
        clean_job = clean_old_attachments.Job()
        clean_job.execute()

    assert Attachment.objects.count() == 0


@pytest.mark.django_db
@freeze_time("2026-06-09 12:00:00")
def test_cleanup_applications_monthly_job():
    from applications.enums import EmployerApplicationStatus
    from common.tests.factories import EmployerApplicationFactory

    # Create old draft (> 5 years)
    with freeze_time("2020-01-01 12:00:00"):
        old_draft = EmployerApplicationFactory(status=EmployerApplicationStatus.DRAFT)

    # Create new draft (< 5 years)
    with freeze_time("2025-01-01 12:00:00"):
        new_draft = EmployerApplicationFactory(status=EmployerApplicationStatus.DRAFT)

    assert EmployerApplication.objects.count() == 2

    # Execute monthly job
    job = cleanup_applications_job.Job()
    job.execute()

    # Only old draft is deleted
    assert EmployerApplication.objects.count() == 1
    assert EmployerApplication.objects.filter(pk=new_draft.pk).exists()
    assert not EmployerApplication.objects.filter(pk=old_draft.pk).exists()
