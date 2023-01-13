import os

from django.core.management.base import BaseCommand

from applications.enums import ApplicationStatus
from applications.models import Application, ApplicationBasis
from applications.tests.factories import ApplicationFactory


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
    which are not deleted with on_delete=CASCADE"""
    Application.objects.all().delete()
    ApplicationBasis.objects.all().delete()


def create_application(status):
    """Create an application"""
    application = ApplicationFactory()
    application.status = status
    application.save()


def run_seed(number):
    """Delete all existing applications and create applications for all statuses"""
    clear_applications()

    for i in range(number):
        for status in ApplicationStatus.values:
            create_application(status)
