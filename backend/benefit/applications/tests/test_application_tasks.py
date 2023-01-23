import os
import random
from datetime import timedelta
from io import StringIO

import faker
from django.core.management import call_command
from django.utils import timezone

from applications.enums import ApplicationStatus
from applications.models import Application, Attachment
from applications.tests.factories import CancelledApplicationFactory


def test_seed_applications_with_arguments():
    amount = 10
    statuses = ApplicationStatus.values
    total_created = len(ApplicationStatus.values) * amount
    out = StringIO()
    call_command("seed", number=amount, stdout=out)

    seeded_applications = Application.objects.filter(
        status__in=statuses,
    )
    assert seeded_applications.count() == total_created
    assert f"Created {total_created} applications" in out.getvalue()


def test_delete_cancelled_applications_older_than_30_days():
    for _ in range(5):
        CancelledApplicationFactory()

    old_applications = Application.objects.filter(status=ApplicationStatus.CANCELLED)
    old_applications.update(modified_at=timezone.now() - timedelta(days=30))

    old_applications_attachment_files = [
        a.attachment_file.path
        for a in Attachment.objects.filter(application__in=old_applications)
    ]

    for _ in range(5):
        days = random.randint(1, 29)
        CancelledApplicationFactory(modified_at=timezone.now() - timedelta(days=days))

    applications = Application.objects.filter(status=ApplicationStatus.CANCELLED)
    total_applications = applications.count()
    out = StringIO()

    call_command("delete_cancelled", stdout=out)

    remaining_applications = Application.objects.filter(
        status=ApplicationStatus.CANCELLED,
        modified_at__gte=(timezone.now() - timedelta(days=30)),
    )

    remaining_applications_attachment_files = [
        a.attachment_file.path
        for a in Attachment.objects.filter(application__in=remaining_applications)
    ]
    # Assert that 5 applications were not deleted
    assert remaining_applications.count() == 5

    # Assert that the attachment files of the remaining applications were not deleted
    for file_path in remaining_applications_attachment_files:
        assert os.path.exists(file_path) is True

    # Assert that the attachment files of the old applications were deleted
    for file_path in old_applications_attachment_files:
        assert os.path.exists(file_path) is False

    # Assert that the correct number of applications were deleted
    assert (
        f"Deleted {total_applications - remaining_applications.count()} cancelled applications"
        in out.getvalue()
    )
