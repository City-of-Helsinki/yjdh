from datetime import timedelta

import faker
import pytz
from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from applications.enums import ApplicationStatus
from applications.models import Application, ApplicationBasis
from applications.tests.factories import (
    AdditionalInformationNeededApplicationFactory,
    ApplicationWithAttachmentFactory,
    CancelledApplicationFactory,
    DecidedApplicationFactory,
    HandlingApplicationFactory,
    ReceivedApplicationFactory,
    RejectedApplicationFactory,
)
from terms.models import Terms


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
        total_created = len(ApplicationStatus.values) * options["number"]
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

    ApplicationBasis.objects.all().delete()
    Terms.objects.all().delete()


def run_seed(number):
    """Delete all existing applications and create applications for all statuses,
    with cancelled applications being modified 31 days ago
    """
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

    thirtyone_days_ago = timezone.now() - timedelta(days=31)

    applications = Application.objects.filter(status=ApplicationStatus.CANCELLED)
    applications.update(modified_at=thirtyone_days_ago)
