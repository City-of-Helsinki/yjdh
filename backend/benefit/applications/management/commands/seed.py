from datetime import datetime, timedelta

import faker
import pytz
from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from applications.enums import ApplicationStatus
from applications.models import Application, ApplicationBasis, ApplicationBatch
from applications.tests.factories import (
    AdditionalInformationNeededApplicationFactory,
    ApplicationBatchFactory,
    ApplicationWithAttachmentFactory,
    CancelledApplicationFactory,
    DecidedApplicationFactory,
    HandlingApplicationFactory,
    ReceivedApplicationFactory,
    RejectedApplicationFactory,
)
from terms.models import Terms
from users.models import User


class Command(BaseCommand):
    help = "Seed the database with applications"

    def add_arguments(self, parser):
        parser.add_argument(
            "--number",
            type=int,
            default=10,
            help="Number of applications to create",
        )

    def handle(self, *args, **options):
        batch_count = 2
        total_created = (len(ApplicationStatus.values) + batch_count) * options[
            "number"
        ]
        if not settings.DEBUG:
            self.stdout.write(
                "Seeding is allowed only when the DEBUG variable set to True"
            )
            return
        run_seed(options["number"])
        self.stdout.write(f"Created {total_created} applications")


def clear_applications():
    """Clear all seeded applications and application basis records and terms,
    which are not deleted with on_delete=CASCADE and delete the media folder"""
    applications = Application.objects.all()
    for application in applications:
        for attachment in application.attachments.all():
            attachment.attachment_file.delete()
    applications.delete()

    ApplicationBatch.objects.all().delete()

    ApplicationBasis.objects.all().delete()
    Terms.objects.all().delete()
    User.objects.filter(last_login=None).exclude(username="admin").delete()


def run_seed(number):
    """Delete all existing applications and create applications for all statuses,
    with cancelled applications being modified 30 days ago and drafts being modified 180 and 166 days ago
    """

    def _create_batch(status: ApplicationStatus):
        batch = ApplicationBatchFactory()

        # Need to delete a few applications that are made for the batch for testing purposes
        Application.objects.filter(batch=batch).delete()

        apps = []
        for _ in range(number):
            if status == ApplicationStatus.ACCEPTED:
                apps.append(DecidedApplicationFactory())
            elif status == ApplicationStatus.REJECTED:
                apps.append(RejectedApplicationFactory())
        batch.applications.set(apps)
        batch.proposal_for_decision = status
        batch.save()

    f = faker.Faker()

    clear_applications()

    factories = (
        AdditionalInformationNeededApplicationFactory,
        ApplicationWithAttachmentFactory,
        CancelledApplicationFactory,
        DecidedApplicationFactory,
        HandlingApplicationFactory,
        ReceivedApplicationFactory,
        RejectedApplicationFactory,
    )

    for factory in factories:
        for _ in range(number):
            random_datetime = f.past_datetime(tzinfo=pytz.UTC)
            application = factory()
            application.created_at = random_datetime
            application.save()

            application.log_entries.all().update(created_at=random_datetime)

    _create_batch(ApplicationStatus.ACCEPTED)
    _create_batch(ApplicationStatus.REJECTED)

    cancelled_deletion_threshold = _past_datetime(30)
    draft_deletion_threshold = _past_datetime(180)
    draft_notify_threshold = _past_datetime(180 - 14)

    cancelled_applications = Application.objects.filter(
        status=ApplicationStatus.CANCELLED
    )
    cancelled_applications.update(modified_at=cancelled_deletion_threshold)

    ids = Application.objects.filter(status=ApplicationStatus.DRAFT).values_list(
        "pk", flat=True
    )[0:5]
    # Update the first 5 drafts to be deleted, then the rest to be notified
    Application.objects.filter(pk__in=ids).update(modified_at=draft_deletion_threshold)
    Application.objects.exclude(pk__in=ids).update(modified_at=draft_notify_threshold)


def _past_datetime(days: int) -> datetime:
    return timezone.now() - timedelta(days=days)
