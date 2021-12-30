import datetime

import pytest
from dateutil.relativedelta import relativedelta
from freezegun import freeze_time

from applications.jobs.monthly.clean_old_applications import (
    Job as CleanOldApplicationJob,
)
from applications.jobs.monthly.clean_old_attachments import (
    Job as CleanOldAttachmentsJob,
)
from applications.models import EmployerApplication, Attachment


@pytest.mark.django_db
def test_clean_old_applications_job(application):
    with freeze_time(
        datetime.date.today() + relativedelta(years=5) - relativedelta(days=1)
    ):
        clean_job = CleanOldApplicationJob()
        clean_job.execute()

    assert EmployerApplication.objects.count() == 1

    with freeze_time(datetime.date.today() + relativedelta(years=5, days=1)):
        clean_job = CleanOldApplicationJob()
        clean_job.execute()

    assert EmployerApplication.objects.count() == 0


@pytest.mark.django_db
def test_clean_old_attachments_job(employment_contract_attachment):
    with freeze_time(
        datetime.date.today() + relativedelta(years=1) - relativedelta(days=1)
    ):
        clean_job = CleanOldAttachmentsJob()
        clean_job.execute()

    assert Attachment.objects.count() == 1

    with freeze_time(datetime.date.today() + relativedelta(years=1, days=1)):
        clean_job = CleanOldAttachmentsJob()
        clean_job.execute()

    assert Attachment.objects.count() == 0
