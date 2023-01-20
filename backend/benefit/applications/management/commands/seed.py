import os
import shutil

import faker
from django.core.management.base import BaseCommand

import helsinkibenefit.settings as settings
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
        if os.getenv("DEBUG") != "1":
            self.stdout.write("Seeding is only allowed in debug mode")
            return
        run_seed(options["number"])
        self.stdout.write(f"Created {total_created} applications")


def clear_applications():
    """Clear all seeded applications and application basis records,
    which are not deleted with on_delete=CASCADE and delete the media folder"""
    Application.objects.all().delete()
    ApplicationBasis.objects.all().delete()
    shutil.rmtree(settings.MEDIA_ROOT)


def run_seed(number):
    """Delete all existing applications and create applications for all statuses"""
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
            random_datetime = f.past_datetime()
            application = factory()
            application.created_at = random_datetime
            application.save()

            application.log_entries.filter(to_status=application.status).update(
                created_at=random_datetime
            )
